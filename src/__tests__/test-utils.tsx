import { screen } from "@testing-library/react";

export { screen };

import {
  type RenderOptions,
  render as rtlRender,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactElement, type ReactNode } from "react";

function CustomProviders({ children }: { children: ReactNode }) {
  return createElement("div", null, children);
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: CustomProviders, ...options }),
  };
}

export { customRender as render, userEvent };
