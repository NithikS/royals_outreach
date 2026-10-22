"use client";

import { useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ClubSectionHeader from "@/app/components/clubSectionHeader";
import Input from "@/app/components/input";
import IconButton from "@/app/components/iconButton";
import SaveButton from "@/app/components/saveButton";
import ClubSettingRow from "@/app/components/clubSettingRow";
import ClubSaveBar from "@/app/components/clubSaveBar";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import ModalShell from "@/app/components/ModalShell";
import EmptyState from "@/app/components/emptyState";
import "@/app/css/club.css";
import { useToast } from "@/app/context/ToastContext";
import { plural } from "@/lib/plural";

import {
  getCategoryUsage,
  saveClubCategories,
  type CategoryUsage,
  type ClubCategory,
} from "@/actions/categories";

type ClubCategoriesUIProps = {
  clubId: number;
  clubName: string;
  initialCategories: ClubCategory[];
};

type PendingDelete = { category: ClubCategory; usage?: CategoryUsage };

const NEW_CATEGORY = {
  categoryName: "New Category",
  goal: 5,
  needsEmailVerification: false,
  needsClubConfirmation: false,
};

export default function ClubCategoriesUI({
  clubId,
  clubName,
  initialCategories,
}: ClubCategoriesUIProps) {
  const { showToast } = useToast();
  // Unsaved categories get negative ids until the server assigns real ones
  const nextTempId = useRef(-1);

  const [categories, setCategories] = useState(initialCategories);
  const [saved, setSaved] = useState(initialCategories);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dirty = JSON.stringify(categories) !== JSON.stringify(saved);

  const update = (categoryId: number, changes: Partial<ClubCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.categoryId === categoryId ? { ...c, ...changes } : c)),
    );
    setError("");
  };

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      { categoryId: nextTempId.current--, ...NEW_CATEGORY },
    ]);
  };

  const removeCategory = (categoryId: number) => {
    setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
    if (categoryId > 0) setDeletedIds((prev) => [...prev, categoryId]);
    setPendingDelete(null);
  };

  // Unsaved categories go straight away; saved ones are checked for hours first
  const handleDelete = async (category: ClubCategory) => {
    if (category.categoryId <= 0) {
      removeCategory(category.categoryId);
      return;
    }
    try {
      const usage = await getCategoryUsage(category.categoryId);
      const inUse =
        usage.loggedHours + usage.additionalHours + usage.opportunities > 0;
      setPendingDelete({ category, usage: inUse ? usage : undefined });
    } catch {
      showToast("Could not check that category. Please try again.", "danger");
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (categories.some((c) => !c.categoryName.trim())) {
      setError("Every category needs a name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveClubCategories(clubId, categories, deletedIds);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCategories(result.categories);
      setSaved(result.categories);
      setDeletedIds([]);
      setError("");
      showToast("Categories saved.", "success");
    } catch {
      showToast("Could not save categories.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setCategories(saved);
    setDeletedIds([]);
    setError("");
  };

  return (
    <div className="club-categories">
      {/* Header */}
      <ClubSectionHeader
        title="Categories"
        subtitle="Set a goal for each category and choose how its hours are approved."
        clubName={clubName}
        actions={
          <SaveButton
            size="sm"
            variant="secondary"
            icon="plus-circle"
            onClick={addCategory}
          >
            Add Category
          </SaveButton>
        }
      />

      {/* Note */}
      <div className="club-note">
        <i className="bi bi-info-circle" aria-hidden="true" />
        <p>
          Every club tracks hours by category. If your club has one hours
          requirement, add a single category such as General Hours and set its
          goal and rules there. Each member group can be given its own set of
          categories.
        </p>
      </div>

      {/* Categories */}
      {categories.length === 0 ? (
        <EmptyState message="No categories yet. Add one to start tracking hours." />
      ) : (
        <div className="club-categories-list">
          {categories.map((c) => (
            <div key={c.categoryId} className="club-category-card">
              <Input
                label="Category Name"
                value={c.categoryName}
                error={
                  error && !c.categoryName.trim()
                    ? "Name is required."
                    : undefined
                }
                onChange={(e) =>
                  update(c.categoryId, { categoryName: e.target.value })
                }
              />
              <Input
                label="Goal (Hours)"
                type="number"
                value={c.goal}
                onChange={(e) =>
                  update(c.categoryId, {
                    goal: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                  })
                }
              />
              <div className="club-category-rules">
                <ClubSettingRow
                  variant="compact"
                  title="Needs Email Verification"
                  description="A coordinator confirms hours by email."
                  checked={c.needsEmailVerification}
                  onChange={(checked) =>
                    update(c.categoryId, { needsEmailVerification: checked })
                  }
                />
                <ClubSettingRow
                  variant="compact"
                  title="Needs Club Confirmation"
                  description="Staff or an exec confirms before hours count."
                  checked={c.needsClubConfirmation}
                  onChange={(checked) =>
                    update(c.categoryId, { needsClubConfirmation: checked })
                  }
                />
              </div>
              <IconButton
                icon="trash"
                label={`Delete ${c.categoryName || "Category"}`}
                className="club-category-delete"
                onClick={() => handleDelete(c)}
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="club-error" role="alert">
          {error}
        </p>
      )}

      {/* Footer */}
      <ClubSaveBar
        dirty={dirty && !isSubmitting}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />

      {/* Dialogs */}
      {pendingDelete && !pendingDelete.usage && (
        <ConfirmDialog
          title="Delete Category"
          message={`Delete ${pendingDelete.category.categoryName}? It is removed from any member groups when you save.`}
          confirmLabel="Delete Category"
          onConfirm={() => removeCategory(pendingDelete.category.categoryId)}
          onClose={() => setPendingDelete(null)}
        />
      )}
      {pendingDelete?.usage && (
        <ModalShell
          title="Category In Use"
          width="480px"
          onClose={() => setPendingDelete(null)}
          footer={
            <SaveButton onClick={() => setPendingDelete(null)}>
              Close
            </SaveButton>
          }
        >
          <p className="confirm-dialog-text">
            {pendingDelete.category.categoryName} cannot be deleted because it
            has{" "}
            {[
              pendingDelete.usage.loggedHours > 0
                ? plural(pendingDelete.usage.loggedHours, "hour request")
                : "",
              pendingDelete.usage.additionalHours > 0
                ? plural(
                    pendingDelete.usage.additionalHours,
                    "added hours entry",
                    "added hours entries",
                  )
                : "",
              pendingDelete.usage.opportunities > 0
                ? plural(
                    pendingDelete.usage.opportunities,
                    "opportunity",
                    "opportunities",
                  )
                : "",
            ]
              .filter(Boolean)
              .join(", ")}
            . Rename it instead, or set its goal to 0.
          </p>
        </ModalShell>
      )}
    </div>
  );
}
