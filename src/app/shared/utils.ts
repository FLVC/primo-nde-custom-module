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