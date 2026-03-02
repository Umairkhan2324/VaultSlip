import { getServerSession } from "@/lib/session";
import { getMe } from "@/lib/api";
import ProfileSection from "@/components/settings/ProfileSection";
import OrganizationSection from "@/components/settings/OrganizationSection";
import ExportPreferencesSection from "@/components/settings/ExportPreferencesSection";
import NotificationPreferencesSection from "@/components/settings/NotificationPreferencesSection";
import ApiKeysSection from "@/components/settings/ApiKeysSection";
import DataManagementSection from "@/components/settings/DataManagementSection";

export default async function SettingsPage() {
  const { token } = await getServerSession();
  const me = await getMe(token).catch(() => ({ plan: "free" as const, email: "", display_name: null }));

  return (
    <div className="space-y-6">
      <header className="animate-float-up rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-50/90 px-5 py-6 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">Manage your account, preferences, and workspace configuration.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSection email={me.email || ""} displayName={me.display_name} />
        <OrganizationSection />
        <ExportPreferencesSection />
        <NotificationPreferencesSection />
        <ApiKeysSection />
        <DataManagementSection />
      </div>
    </div>
  );
}
