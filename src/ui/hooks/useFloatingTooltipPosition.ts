import { useEffect } from "react";

const tooltipWidth = 360;
const viewportGap = 16;
const cursorOffset = 18;

export function useFloatingTooltipPosition() {
  useEffect(() => {
    let activeScope: HTMLElement | undefined;

    const activateScope = (scope: HTMLElement) => {
      if (activeScope === scope) return;
      activeScope?.classList.remove("is-tooltip-active");
      activeScope = scope;
      activeScope.classList.add("is-tooltip-active");
    };

    const clearActiveScope = () => {
      activeScope?.classList.remove("is-tooltip-active");
      activeScope = undefined;
    };

    const placeTooltip = (scope: HTMLElement, clientX: number, clientY: number) => {
      const tooltip = scope.querySelector<HTMLElement>(".item-tooltip");
      const width = Math.min(tooltipWidth, window.innerWidth - viewportGap * 2);
      const height = Math.min(tooltip?.scrollHeight || 320, window.innerHeight - viewportGap * 2);
      let left = clientX + cursorOffset;
      let top = clientY + cursorOffset;

      if (left + width > window.innerWidth - viewportGap) {
        left = clientX - width - cursorOffset;
      }

      if (top + height > window.innerHeight - viewportGap) {
        top = window.innerHeight - height - viewportGap;
      }

      left = clamp(left, viewportGap, window.innerWidth - width - viewportGap);
      top = clamp(top, viewportGap, window.innerHeight - height - viewportGap);

      scope.style.setProperty("--tooltip-left", `${left}px`);
      scope.style.setProperty("--tooltip-top", `${top}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const scope = target.closest<HTMLElement>(".item-hover-scope");
      if (!scope) {
        clearActiveScope();
        return;
      }
      activateScope(scope);
      placeTooltip(scope, event.clientX, event.clientY);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const scope = target.closest<HTMLElement>(".item-hover-scope");
      if (!scope) return;
      activateScope(scope);
      const rect = scope.getBoundingClientRect();
      placeTooltip(scope, rect.right, rect.top);
    };

    const onFocusOut = () => {
      if (activeScope?.matches(":focus-within")) return;
      clearActiveScope();
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      clearActiveScope();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
