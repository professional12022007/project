const citizenService = require('../services/citizenService');

exports.getCitizenProfile = async (req, res, next) => {
  try {
    const { citizenId } = req.params;
    const profile = await citizenService.getCitizenProfile(citizenId);
    if (!profile) {
      return res.status(404).json({ error: 'Citizen not found' });
    }
    // Return fields expected by frontend
    const { id, name, email, age, income, state, stage } = profile;
    res.json({ id, name, email, age, income, state, stage });
  } catch (err) {
    next(err);
  }
};
