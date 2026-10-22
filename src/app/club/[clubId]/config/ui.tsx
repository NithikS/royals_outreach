"use client";

import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ClubSectionHeader from "@/app/components/clubSectionHeader";
import SectionHead from "@/app/components/sectionHead";
import Input from "@/app/components/input";
import SaveButton from "@/app/components/saveButton";
import ClubSettingRow from "@/app/components/clubSettingRow";
import ClubSaveBar from "@/app/components/clubSaveBar";
import "@/app/css/club.css";
import { useToast } from "@/app/context/ToastContext";

import { updateClubConfigById, type ClubConfig } from "@/actions/club";

type ConfigForm = Omit<ClubConfig, "clubId" | "isConfigured">;

export default function ClubConfigUI({ club }: { club: ClubConfig }) {
  const { showToast } = useToast();
  const { clubId, isConfigured, ...initial } = club;

  const [form, setForm] = useState<ConfigForm>(initial);
  const [saved, setSaved] = useState<ConfigForm>(initial);
  // A new club has no hour settings in the database yet, so the defaults shown still need saving
  const [configured, setConfigured] = useState(isConfigured);
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dirty = !configured || (Object.keys(form) as (keyof ConfigForm)[]).some((key) => form[key] !== saved[key]);
  const update = (changes: Partial<ConfigForm>) => setForm((prev) => ({ ...prev, ...changes }));

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!form.clubName.trim()) {
      setNameError("Club name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateClubConfigById(clubId, form);
      if (!result.success) {
        setNameError(result.error ?? "");
        return;
      }
      const next = { ...form, clubName: result.clubName ?? form.clubName };
      setForm(next);
      setSaved(next);
      setConfigured(true);
      showToast("Club config saved.", "success");
    } catch {
      showToast("Could not save club config.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setForm(saved);
    setNameError("");
  };

  return (
    <div className="club-config">
      {/* Header */}
      <ClubSectionHeader
        title="Club Config"
        subtitle="Name, logo and hour rules for this club."
        clubName={saved.clubName}
        actions={
          <div className="club-config-header-actions">
            <SaveButton size="sm" variant="secondary" icon="tags" href={`/club/${clubId}/categories`}>
              Configure Categories
            </SaveButton>
            <SaveButton size="sm" variant="secondary" icon="people" href={`/club/${clubId}/members`}>
              Manage Members
            </SaveButton>
          </div>
        }
      />

      {/* Club Details */}
      <section>
        <SectionHead>Club Details</SectionHead>
        <div className="club-config-details">
          <Input
            label="Club Name"
            value={form.clubName}
            error={nameError}
            onChange={(e) => {
              update({ clubName: e.target.value });
              setNameError("");
            }}
          />
          <div className="club-config-logo">
            <div className="club-config-logo-tile" aria-hidden="true">
              <i className="bi bi-award" />
            </div>
            <div className="club-config-logo-buttons">
              {/* TODO: wire up once logo file storage is chosen */}
              <SaveButton size="sm" variant="secondary" icon="upload" disabled>
                Upload Logo
              </SaveButton>
              <SaveButton
                size="sm"
                variant="secondary"
                icon="trash"
                disabled={!form.clubLogoFileId}
                onClick={() => update({ clubLogoFileId: null })}
              >
                Remove
              </SaveButton>
            </div>
          </div>
        </div>
      </section>

      {/* Hour Rules */}
      <section>
        <SectionHead>Hour Rules</SectionHead>
        <ClubSettingRow
          title="Exec Needs Hours"
          description="Student execs log hours like other members."
          checked={form.execNeedsHours}
          onChange={(checked) => update({ execNeedsHours: checked })}
        />
        <ClubSettingRow
          title="Allow Double Dipping"
          description="Students can count the same hours toward more than one club."
          checked={form.doubleDipping}
          onChange={(checked) => update({ doubleDipping: checked })}
        />
      </section>

      {/* Footer */}
      <ClubSaveBar dirty={dirty && !isSubmitting} onDiscard={handleDiscard} onSave={handleSave} />
    </div>
  );
}
