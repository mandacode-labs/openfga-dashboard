import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModelViewer } from "@/features/model/model-viewer";
import type { AuthorizationModel } from "@/types";

describe("ModelViewer", () => {
  const baseModel: AuthorizationModel = {
    id: "test-model-id",
    schema_version: "1.1",
    type_definitions: [],
  };

  it("shows 'No types defined' when type_definitions is empty", () => {
    render(<ModelViewer model={baseModel} />);
    expect(screen.getByText("No types defined")).toBeInTheDocument();
  });

  it("renders type definitions", () => {
    const model: AuthorizationModel = {
      ...baseModel,
      type_definitions: [
        {
          type: "document",
          relations: {
            viewer: { this: {} },
            editor: {
              union: { child: [{ computedUserset: { relation: "viewer" } }] },
            },
          },
        },
      ],
    };
    render(<ModelViewer model={model} />);
    expect(screen.getByText("document")).toBeInTheDocument();
    expect(screen.getByText("viewer")).toBeInTheDocument();
    expect(screen.getByText("editor")).toBeInTheDocument();
    expect(screen.getByText("direct")).toBeInTheDocument();
    expect(screen.getByText("union")).toBeInTheDocument();
  });

  it("renders multiple types", () => {
    const model: AuthorizationModel = {
      ...baseModel,
      type_definitions: [
        { type: "document", relations: { viewer: { this: {} } } },
        { type: "user", relations: {} },
      ],
    };
    render(<ModelViewer model={model} />);
    expect(screen.getByText("document")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
    expect(screen.getByText("No relations")).toBeInTheDocument();
  });

  it("shows 'No relations' when relations object is empty", () => {
    const model: AuthorizationModel = {
      ...baseModel,
      type_definitions: [{ type: "user", relations: {} }],
    };
    render(<ModelViewer model={model} />);
    expect(screen.getByText("No relations")).toBeInTheDocument();
  });
});
