import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Login from "./Login";

test("login form renders", () => {
  render(<Login />);

  expect(
    screen.getByPlaceholderText(/Email/i)
  ).toBeInTheDocument();
});
