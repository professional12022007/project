import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bell,
  FileText,
  Clock,
  Info,
  TrendingUp,
  CheckCheck,
  Trash2,
  ChevronLeft,
  Zap,
  CircleCheck as CheckCircle2,
  Building2,
  Hourglass,
} from "lucide-react-native";
import { useThemedStyles, usePalette } from "@/hooks/useThemedStyles";
import { useAuthStore } from "@/store/authStore";
import {
  notificationService,
  Notification,
} from "@/lib/api/services/notificationService";
import { apiClient } from "@/lib/api/client";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

const STORAGE_KEY = "@benefitos_notifications";

type Pref = { key: string; label: string; description: string };

const PREFS: Pref[] = [
  { key: "scheme_alerts", label: "New Scheme Alerts", description: "Notify when new government schemes match your profile" },
  { key: "document_reminders", label: "Document Reminders", description: "Remind you to upload or renew expiring documents" },
  { key: "weekly_digest", label: "Weekly Digest", description: "A weekly summary of your welfare score progress" },
  { key: "application_updates", label: "Application Updates", description: "Status changes on schemes you have applied for" },
  { key: "family_alerts", label: "Family Member Alerts", description: "Notify when new schemes are found for your household members" },
];

const DEFAULT: Record<string, boolean> = {
  scheme_alerts: true,
  document_reminders: true,
  weekly_digest: false,
  application_updates: true,
  family_alerts: true,
};

function getNotifIcon(type: string, palette: ReturnType<typeof usePalette>) {
  const iconProps = { size: 18, strokeWidth: 2 };
  switch (type) {
    case "newly_eligible":
      return <TrendingUp {...iconProps} color={palette.success} />;
    case "missing_documents":
      return <FileText {...iconProps} color={palette.amber} />;
    case "upcoming_eligibility":
      return <Clock {...iconProps} color={palette.primary} />;
    case "roadmap_milestone":
      return <Zap {...iconProps} color={palette.secondary} />;
    case "profile_incomplete":
      return <Info {...iconProps} color={palette.error} />;
    case "document_uploaded":
      return <CheckCircle2 {...iconProps} color={palette.success} />;
    case "application_submitted":
      return <Building2 {...iconProps} color={palette.primary} />;
    case "application_approved":
      return <CheckCircle2 {...iconProps} color={palette.success} />;
    case "application_rejected":
      return <Info {...iconProps} color={palette.error} />;
    case "new_scheme_launched":
      return <TrendingUp {...iconProps} color={palette.secondary} />;
    case "deadline_approaching":
      return <Hourglass {...iconProps} color={palette.amber} />;
    default:
      return <Bell {...iconProps} color={palette.primary} />;
  }
}

function formatTimestamp(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

interface Props {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: Props) {
  const { user } = useAuthStore();
  const palette = usePalette();
  const [activeTab, setActiveTab] = useState<"inbox" | "prefs">("inbox");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);

  const s = useThemedStyles((p) => StyleSheet.create({
    container: { flex: 1, backgroundColor: p.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
      borderBottomWidth: 1, borderBottomColor: p.border,
    },
    backBtn: { width: 40, paddingVertical: 4 },
    headerTitleRow: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    title: { color: p.textPrimary, fontSize: 17, fontWeight: "700" },
    badge: {
      backgroundColor: p.primary, borderRadius: 10,
      paddingHorizontal: 7, paddingVertical: 2, minWidth: 20, alignItems: "center",
    },
    badgeText: { color: p.white, fontSize: 11, fontWeight: "700" },
    tabs: {
      flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: p.border,
    },
    tab: {
      flex: 1, paddingVertical: 8, alignItems: "center",
      borderRadius: 12, backgroundColor: p.surface,
      marginHorizontal: 4, borderWidth: 1, borderColor: p.border,
    },
    tabActive: { backgroundColor: p.primary, borderColor: p.primary },
    tabText: { color: p.textSecondary, fontWeight: "600", fontSize: 13 },
    tabTextActive: { color: p.white },
    body: { padding: 20, paddingBottom: 60 },
    inboxHeader: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
    },
    inboxHeaderText: {
      fontSize: 11, fontWeight: "700", textTransform: "uppercase",
      color: p.textMuted, letterSpacing: 0.8,
    },
    markAllRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    markAllText: { fontSize: 12, fontWeight: "bold", color: p.primary },
    workflowCard: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: p.surface, borderRadius: 20,
      borderWidth: 1, borderColor: p.border, padding: 16, marginBottom: 20,
    },
    workflowTitle: { fontSize: 15, fontWeight: "700", color: p.textPrimary, marginBottom: 4 },
    workflowDesc: { fontSize: 12, color: p.textSecondary, marginRight: 12 },
    workflowBtn: {
      backgroundColor: p.primary, borderRadius: 10,
      paddingVertical: 8, paddingHorizontal: 14,
    },
    workflowBtnText: { color: p.white, fontSize: 12, fontWeight: "700" },
    notifCard: {
      backgroundColor: p.surface, borderRadius: 16,
      borderWidth: 1, borderColor: p.border, padding: 16, marginBottom: 12,
    },
    unreadCard: {
      borderColor: p.primary,
      borderLeftWidth: 4,
      backgroundColor: p.primaryA12,
    },
    readCard: {
      opacity: 0.65,
    },
    notifHeader: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8,
    },
    notifTypeRow: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
    notifIconBox: {
      width: 32, height: 32, borderRadius: 10,
      alignItems: "center", justifyContent: "center",
    },
    notifTitle: { fontSize: 15, fontWeight: "700", color: p.textPrimary, flex: 1 },
    notifTitleRead: { fontWeight: "500" as any, color: p.textSecondary },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: p.primary, marginTop: 6 },
    notifMsg: { fontSize: 13, color: p.textSecondary, lineHeight: 18, marginBottom: 8 },
    notifMsgRead: { color: p.textMuted },
    notifTimestamp: { fontSize: 11, color: p.textMuted, marginBottom: 8 },
    notifTypeBadge: {
      flexDirection: "row", alignItems: "center", gap: 4,
      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
      marginBottom: 10,
    },
    notifTypeText: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    notifActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", borderTopWidth: 1, borderTopColor: p.border, paddingTop: 10 },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 4 },
    actionText: { fontSize: 12, fontWeight: "600", color: p.primary },
    emptyCard: {
      backgroundColor: p.surface, borderWidth: 1, borderColor: p.border,
      borderRadius: 20, padding: 32, alignItems: "center", gap: 12,
    },
    emptyText: { color: p.textSecondary, textAlign: "center", fontSize: 13, lineHeight: 19 },
    skeletonCard: {
      padding: 16, borderRadius: 16, backgroundColor: p.surface,
      borderWidth: 1, borderColor: p.border, gap: 8,
    },
    sectionTitle: {
      fontSize: 11, fontWeight: "700", textTransform: "uppercase",
      color: p.textMuted, letterSpacing: 0.8, marginBottom: 12,
    },
    card: {
      backgroundColor: p.surface, borderRadius: 20,
      borderWidth: 1, borderColor: p.border, overflow: "hidden",
    },
    row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
    rowText: { flex: 1, marginRight: 16 },
    rowLabel: { color: p.textPrimary, fontSize: 15, fontWeight: "600", marginBottom: 3 },
    rowDesc: { color: p.textSecondary, fontSize: 12, lineHeight: 17 },
  }));

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.warn("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setPrefs(JSON.parse(val));
      setPrefsReady(true);
    });
    Promise.resolve().then(() => {
      fetchNotifications();
    });
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    const onBackPress = () => {
      onBack();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => { subscription.remove(); };
  }, [onBack]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const togglePref = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationService.markAsRead(id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      Alert.alert("Error", "Failed to mark notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!user?.id) return;
    try {
      await notificationService.markAllRead(user.id);
    } catch {
      Alert.alert("Error", "Failed to mark all notifications as read.");
      fetchNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationService.deleteNotification(id);
    } catch {
      setNotifications(snapshot);
      Alert.alert("Error", "Failed to delete notification.");
    }
  };

  const handleTriggerWorkflow = async () => {
    if (!user?.id) return;
    setTriggeringWorkflow(true);
    try {
      await apiClient.post("/api/workflows/recalculate", { citizenId: user.id });
      await fetchNotifications();
    } catch {
      Alert.alert("Error", "Failed to trigger background calculation engine.");
    } finally {
      setTriggeringWorkflow(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeBadgeStyle = (type: string) => {
    switch (type) {
      case "newly_eligible":
      case "new_scheme_launched":
        return { bg: palette.successA18, text: palette.success };
      case "missing_documents":
      case "deadline_approaching":
        return { bg: palette.warningA18, text: palette.amber };
      case "upcoming_eligibility":
      case "application_submitted":
        return { bg: palette.primaryA18, text: palette.primary };
      case "roadmap_milestone":
        return { bg: palette.secondaryA0D, text: palette.secondary };
      case "profile_incomplete":
      case "application_rejected":
        return { bg: palette.errorA18, text: palette.error };
      case "document_uploaded":
      case "application_approved":
        return { bg: palette.successA18, text: palette.success };
      default:
        return { bg: palette.primaryA18, text: palette.primary };
    }
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      newly_eligible: "Newly Eligible",
      missing_documents: "Missing Documents",
      upcoming_eligibility: "Upcoming Eligibility",
      roadmap_milestone: "Roadmap",
      profile_incomplete: "Profile",
      document_uploaded: "Document Uploaded",
      application_submitted: "Application Submitted",
      application_approved: "Application Approved",
      application_rejected: "Application Rejected",
      new_scheme_launched: "New Scheme",
      deadline_approaching: "Deadline",
      ai_recommendation: "AI Recommendation",
    };
    return labels[type] || "Notification";
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn}>
          <ChevronLeft size={22} color={palette.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerTitleRow}>
          <Bell size={18} color={palette.textPrimary} strokeWidth={2} />
          <Text style={s.title}>Notifications</Text>
          {unreadCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{unreadCount}</Text></View>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, activeTab === "inbox" && s.tabActive]} onPress={() => setActiveTab("inbox")}>
          <Text style={[s.tabText, activeTab === "inbox" && s.tabTextActive]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === "prefs" && s.tabActive]} onPress={() => setActiveTab("prefs")}>
          <Text style={[s.tabText, activeTab === "prefs" && s.tabTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === "inbox" ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
          ) : undefined
        }
      >
        {activeTab === "inbox" ? (
          <>
            <View style={s.workflowCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.workflowTitle}>Recalculation Engine</Text>
                <Text style={s.workflowDesc}>Force live recalculations and refresh your score metrics.</Text>
              </View>
              <TouchableOpacity
                onPress={handleTriggerWorkflow}
                disabled={triggeringWorkflow}
                style={[s.workflowBtn, triggeringWorkflow && { opacity: 0.6 }]}
                activeOpacity={0.8}
              >
                {triggeringWorkflow ? (
                  <ActivityIndicator color={palette.white} size="small" />
                ) : (
                  <Text style={s.workflowBtnText}>Recalculate</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={s.inboxHeader}>
              <Text style={s.inboxHeaderText}>Inbox messages</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
                  <View style={s.markAllRow}>
                    <CheckCheck size={16} color={palette.primary} strokeWidth={2} />
                    <Text style={s.markAllText}>Mark All Read</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={{ gap: 12 }}>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={s.skeletonCard}>
                    <SkeletonLoader height={18} width="35%" />
                    <SkeletonLoader height={14} width="80%" />
                  </View>
                ))}
              </View>
            ) : notifications.length > 0 ? (
              notifications.map((n) => {
                const badge = typeBadgeStyle(n.type);
                return (
                  <View key={n.id} style={[s.notifCard, !n.read && s.unreadCard, n.read && s.readCard]}>
                    <View style={s.notifHeader}>
                      <View style={s.notifTypeRow}>
                        <View style={[s.notifIconBox, { backgroundColor: badge.bg }]}>
                          {getNotifIcon(n.type, palette)}
                        </View>
                        <Text style={[s.notifTitle, n.read && s.notifTitleRead]}>{n.title || typeLabel(n.type)}</Text>
                      </View>
                      {!n.read && <View style={s.unreadDot} />}
                    </View>
                    {n.message ? (
                      <Text style={[s.notifMsg, n.read && s.notifMsgRead]}>{n.message}</Text>
                    ) : null}
                    {n.createdAt ? (
                      <Text style={s.notifTimestamp}>{formatTimestamp(n.createdAt)}</Text>
                    ) : null}
                    <View style={[s.notifTypeBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[s.notifTypeText, { color: badge.text }]}>{typeLabel(n.type)}</Text>
                    </View>
                    <View style={s.notifActions}>
                      {!n.read && (
                        <TouchableOpacity onPress={() => handleMarkRead(n.id)} style={s.actionBtn}>
                          <Text style={s.actionText}>Mark Read</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => handleDelete(n.id)} style={[s.actionBtn, { marginLeft: 12 }]}>
                        <Trash2 size={16} color={palette.error} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={s.emptyCard}>
                <Bell size={32} color={palette.textMuted} strokeWidth={1.5} />
                <Text style={s.emptyText}>All caught up. No notifications in your inbox.</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={s.sectionTitle}>Preferences</Text>
            <View style={s.card}>
              {PREFS.map((pref, idx) => (
                <View key={pref.key} style={[s.row, idx < PREFS.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.border }]}>
                  <View style={s.rowText}>
                    <Text style={s.rowLabel}>{pref.label}</Text>
                    <Text style={s.rowDesc}>{pref.description}</Text>
                  </View>
                  <Switch
                    value={prefsReady ? prefs[pref.key] : false}
                    onValueChange={() => togglePref(pref.key)}
                    trackColor={{ false: palette.border, true: palette.primaryA55 }}
                    thumbColor={prefs[pref.key] ? palette.primary : palette.textMuted}
                    ios_backgroundColor={palette.border}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
