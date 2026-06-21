import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EmissionForm from "./EmissionForm";

test("shows validation error", () => {
  render(<EmissionForm />);

  fireEvent.click(screen.getByText(/Calculate/i));

  expect(
    screen.getByText(/Please enter a value/i)
  ).toBeInTheDocument();
});
