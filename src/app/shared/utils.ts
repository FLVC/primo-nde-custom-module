export type ParsedVid = { institutionCode: string | null; viewId: string | null };

/**
 * Hide a mat-select control by partial id
 *
 * @param id - the partial id of the <mat-select> element
 */
export function hideMatSelectById(id: string) {
  const selector: string = '[id*="' + id + '"]';
  const matSelect = document.querySelector(selector) as HTMLElement | null;
  if (!matSelect) return;

  // Find the closest Material form-field container
  const formField = matSelect.closest('.mat-mdc-form-field') as HTMLElement | null;
  const target = formField ?? matSelect;

  // Hide
  target.style.display = 'none';

  // Accessibility: reflect hidden state
  target.setAttribute('aria-hidden', 'true');
}

/**
 * Get the currently displayed label from a <mat-select> — no Angular refs required.
 * Works when the panel is closed or open.
 *
 * @param select - a CSS selector or the <mat-select> Element itself
 * @returns label text or null if not found
 */
export function getMatSelectDisplayedLabel(select: string | Element): string | null {
  const el =
    typeof select === 'string'
      ? document.querySelector(select)
      : select;

  if (!el) return null;

  // The label shown in the closed state is rendered here:
  const labelEl = el.querySelector('.mat-mdc-select-value-text');
  return labelEl?.textContent?.trim() || null;
}

/**
 * Parses the institution code and view id from the vid value
 *
 * @param vid - "<prefix>_<institutionCode>:<viewId>"
 * @returns institution code and view id
 */
export function parseVid(vid: string): ParsedVid {
  const [left, viewId] = vid.split(':', 2);
  const [, institutionCode] = left.split('_', 2);
  return { institutionCode, viewId };
}

/**
 * Truncates a string if it exceeds the given max length
 * and appends an ellipsis to indicate truncation.
 *
 * @param str        The input string to truncate.
 * @param maxLength  The maximum allowed length (before ellipsis).
 * @returns          Truncated string with an ellipsis, or the original string.
 */
export function truncateWithEllipsis(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
}

