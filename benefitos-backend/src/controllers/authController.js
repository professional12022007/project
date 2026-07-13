const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const citizenQueries = require("../queries/citizenQueries");
const welfareService = require("../services/welfareService");
const roadmapService = require("../services/roadmapService");

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, age, income, state, profession } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields (name, email, password)" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await citizenQueries.findCitizenByEmail(email);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Validate required welfare fields
    if (age === undefined || age === null || age === "") {
      return res.status(400).json({ error: "Age is required and must be a number" });
    }
    if (income === undefined || income === null || income === "") {
      return res.status(400).json({ error: "Income is required and must be a number" });
    }
    if (!state) {
      return res.status(400).json({ error: "State is required" });
    }
    if (!profession) {
      return res.status(400).json({ error: "Profession is required" });
    }
    if (isNaN(Number(age))) {
      return res.status(400).json({ error: "Age must be a valid number" });
    }
    if (isNaN(Number(income))) {
      return res.status(400).json({ error: "Income must be a valid number" });
    }

    const citizenId = `citizen_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const stage = Number(age) >= 60 ? "senior-citizen" : "student";

    const createdList = await citizenQueries.createCitizenAccount(citizenId, {
      name,
      email,
      password: hashedPassword,
      age: Number(age),
      income: Number(income),
      state,
      stage,
      profession,
    });

    if (!createdList || createdList.length === 0) {
      return res.status(500).json({ error: "Failed to create citizen account" });
    }

    // Trigger calculations
    await welfareService.recalculateEligibility(citizenId);
    await roadmapService.refreshRoadmapRelationships(citizenId);
    await welfareService.refreshRecommendationRelationships(citizenId);

    // Generate initial notifications
    const workflowService = require("../services/workflowService");
    await workflowService.runRecalculationWorkflowForCitizen(citizenId).catch(err => {
      console.error("[Register] Notification generation failed:", err.message);
    });

    const token = jwt.sign({ id: citizenId, email }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      user: {
        id: citizenId,
        name,
        email,
        age: age ? Number(age) : null,
        income: income ? Number(income) : null,
        state,
        stage,
        profession,
      },
      token,
      refreshToken: "dummy-refresh-token",
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const citizens = await citizenQueries.findCitizenByEmail(email);
    if (!citizens || citizens.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const citizen = citizens[0];
    const secureCitizens = await citizenQueries.findCitizenByIdSecure(citizen.id);
    if (!secureCitizens || secureCitizens.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const secureCitizen = secureCitizens[0];
    const isMatch = await bcrypt.compare(password, secureCitizen.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: citizen.id, email: citizen.email }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      user: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        age: citizen.age,
        income: citizen.income,
        state: citizen.state,
        stage: citizen.stage,
        profession: citizen.profession,
      },
      token,
      refreshToken: "dummy-refresh-token",
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const citizenId = req.user.id;

    // Refresh database relationships for session restore
    await welfareService.recalculateEligibility(citizenId).catch(err => {
      console.error("[getMe Recalculation] Failed to calculate eligibility:", err.message);
    });

    // Generate notifications if none exist yet
    const workflowService = require("../services/workflowService");
    await workflowService.runRecalculationWorkflowForCitizen(citizenId).catch(err => {
      console.error("[getMe Notifications] Failed to generate notifications:", err.message);
    });

    const profiles = await citizenQueries.findCitizenById(citizenId);
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const profile = profiles[0];
    res.json({
      id: profile.id,
      name: profile.name,
      email: req.user.email || profile.email || `${profile.id}@benefitos.dev`,
      age: profile.age,
      income: profile.income,
      state: profile.state,
      stage: profile.stage,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const { name, age, income, state, stage } = req.body;

    // Fetch existing profile
    const secureCitizens = await citizenQueries.findCitizenByIdSecure(citizenId);
    if (!secureCitizens || secureCitizens.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }
    const secureCitizen = secureCitizens[0];

    // Build updated profile, using existing values for omitted fields
    const updatedProfile = {
      name: name !== undefined ? name.trim() : secureCitizen.name,
      age: age !== undefined ? Number(age) : secureCitizen.age,
      income: income !== undefined ? Number(income) : secureCitizen.income,
      state: state !== undefined ? state : secureCitizen.state,
      stage: stage !== undefined ? stage : secureCitizen.stage,
    };

    // Validate fields if they were provided
    if (name !== undefined && (!updatedProfile.name || updatedProfile.name.length === 0)) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }
    if (age !== undefined && isNaN(updatedProfile.age)) {
      return res.status(400).json({ error: "Age must be a valid number" });
    }
    if (income !== undefined && isNaN(updatedProfile.income)) {
      return res.status(400).json({ error: "Income must be a valid number" });
    }
    if (state !== undefined && (!updatedProfile.state || updatedProfile.state.length === 0)) {
      return res.status(400).json({ error: "State is required" });
    }

    await citizenQueries.upsertCitizenProfile(citizenId, updatedProfile);

    // Refresh graph intelligence
    await welfareService.recalculateEligibility(citizenId);
    await roadmapService.refreshRoadmapRelationships(citizenId);
    await welfareService.refreshRecommendationRelationships(citizenId);

    res.json({
      id: citizenId,
      name: updatedProfile.name,
      email: secureCitizen.email,
      age: updatedProfile.age,
      income: updatedProfile.income,
      state: updatedProfile.state,
      stage: updatedProfile.stage,
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const secureCitizens = await citizenQueries.findCitizenByIdSecure(citizenId);
    if (!secureCitizens || secureCitizens.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const secureCitizen = secureCitizens[0];
    const isMatch = await bcrypt.compare(oldPassword, secureCitizen.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await citizenQueries.updateCitizenPassword(citizenId, hashedNewPassword);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
