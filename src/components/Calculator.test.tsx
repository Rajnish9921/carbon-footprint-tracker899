import { render, screen } from "@testing-library/react";
import Calculator from "./Calculator";

test("renders calculator heading", () => {
  render(<Calculator />);

  expect(
    screen.getByText(/Carbon Footprint Calculator/i)
  ).toBeInTheDocument();
});
