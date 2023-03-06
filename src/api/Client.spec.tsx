import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

const Fetch = ({ url }: { url: string }) => (
  <>
    <div role="heading">hello there</div>
    <button role="button" onClick={() => {}} disabled>
      Load Greeting
    </button>
  </>
);

test("loads and displays greeting", async () => {
  // ARRANGE
  render(<Fetch url="/greeting" />);

  // ACT
  await userEvent.click(screen.getByText("Load Greeting"));
  await screen.findByRole("heading");

  // ASSERT
  expect(screen.getByRole("heading")).toHaveTextContent("hello there");
  expect(screen.getByRole("button")).toBeDisabled();
});
