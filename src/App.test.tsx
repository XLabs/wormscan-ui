import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Hero } from "./pages/Home/Hero";
import "./i18n";

test("Home > Hero Component", async () => {
  // ARRANGE
  render(<Hero />);

  // ACT
  const heroTextElement: HTMLElement = screen.getByText(/The Wormhole Explorer/i);
  const searchBarElement: HTMLElement = screen.getByPlaceholderText(/Search by TxHash/i);

  // ASSERT
  expect(heroTextElement).toBeInTheDocument();
  expect(searchBarElement).toBeInTheDocument();
});
