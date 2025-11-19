import { render, screen } from "@testing-library/react";
import Login from "../../../pages/auth/Login";

test("renders login message", () => {
  render(<Login />);
  const text = screen.getByText("Fucking shit");
  expect(text).toBeInTheDocument();
});
