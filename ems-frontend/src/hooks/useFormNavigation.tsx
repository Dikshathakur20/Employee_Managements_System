import { useEffect } from "react";

export const useFormNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Only handle specific elements
      if (!["INPUT", "SELECT", "TEXTAREA", "BUTTON", "DIV"].includes(target.tagName)) return;

      const form = target.closest("form");
      if (!form) return;

      const focusable = Array.from(
        form.querySelectorAll<HTMLElement>(
          "input, select, textarea, button, [tabindex]:not([tabindex='-1']), [role='button']"
        )
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          !el.getAttribute("aria-hidden") &&
          el.offsetParent !== null
      );

      const index = focusable.indexOf(target);

      // -----------------------------
      // ENTER KEY
      // -----------------------------
      if (e.key === "Enter") {
        e.preventDefault();

        // FILE INPUT SPECIAL CASE
        if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "file") {
          const fileInput = target as HTMLInputElement;
          const submitButton = form.querySelector("button[type='submit']") as HTMLButtonElement | null;

          if (fileInput.files && fileInput.files.length > 0) {
            // FILE EXISTS → move to next input
            const next = focusable[index + 1];
            if (next) next.focus();
          } else {
            // NO FILE → trigger submit button
            submitButton?.click();
          }
          return;
        }

        // Custom Shadcn SelectTrigger
        if (target.getAttribute("role") === "button") {
          const next = focusable[index + 1];
          if (next) next.focus();
          return;
        }

        // Default: submit the form
        const submitButton = form.querySelector("button[type='submit']") as HTMLButtonElement | null;
        if (submitButton) submitButton.click();
        else form.submit();

        return;
      }

      // -----------------------------
      // Arrow Navigation
      // -----------------------------
      if (["ArrowDown", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const next = focusable[index + 1];
        if (next) next.focus();
        return;
      }

      if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        const prev = focusable[index - 1];
        if (prev) prev.focus();
        return;
      }

      // -----------------------------
      // ESC → focus Cancel button
      // -----------------------------
      if (e.key === "Escape") {
        e.preventDefault();
        const cancelButton = Array.from(form.querySelectorAll("button")).find(
          (btn) =>
            btn.textContent?.trim().toLowerCase() === "cancel" ||
            btn.getAttribute("data-role") === "cancel"
        ) as HTMLButtonElement | undefined;

        if (cancelButton) cancelButton.focus();
      }
    };

    // Focus first input when form mounts (for dialogs/modals)
    const focusFirstInput = () => {
      const forms = document.querySelectorAll("form");
      forms.forEach((form) => {
        const firstInput = form.querySelector<HTMLElement>(
          "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])"
        );
        if (firstInput) firstInput.focus();
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    focusFirstInput();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
