import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateStoreDialog } from "@/features/stores/create-store-dialog";

describe("CreateStoreDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  it("renders the dialog when open", () => {
    render(<CreateStoreDialog {...defaultProps} />);
    expect(screen.getByText("Create Store")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("My Store")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<CreateStoreDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Create Store")).not.toBeInTheDocument();
  });

  it("calls onSubmit with trimmed name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(
      <CreateStoreDialog
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText("My Store");
    await user.type(input, "  My Store  ");
    await user.click(screen.getByText("Create"));

    expect(onSubmit).toHaveBeenCalledWith("My Store");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows error message on submission failure", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Creation failed"));
    render(
      <CreateStoreDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText("My Store");
    await user.type(input, "Failing Store");
    await user.click(screen.getByText("Create"));

    expect(await screen.findByText("Creation failed")).toBeInTheDocument();
  });

  it("disables create button when name is empty", () => {
    render(<CreateStoreDialog {...defaultProps} />);
    expect(screen.getByText("Create")).toBeDisabled();
  });

  it("enables create button when name is provided", async () => {
    const user = userEvent.setup();
    render(<CreateStoreDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText("My Store");
    await user.type(input, "New Store");
    expect(screen.getByText("Create")).not.toBeDisabled();
  });
});
