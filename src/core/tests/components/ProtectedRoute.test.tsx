import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { renderWithStore } from "../../utils/test-utils";

function DummyPage() {
  return <div>Dashboard Page</div>;
}

test("redirects to /login when not authenticated", () => {
  const { ui } = renderWithStore(
    <ProtectedRoute>
      <DummyPage />
    </ProtectedRoute>,
    {
      auth: {
        isAuthenticated: false,
        token: null,
        role: null,
        loading: false,
      },
    }
  );

  render(ui);

  // expect NOT to see protected page
  expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
});

test("blocks access when user role does not match", () => {
  const { ui } = renderWithStore(
    <ProtectedRoute role="admin">
      <DummyPage />
    </ProtectedRoute>,
    {
      auth: {
        isAuthenticated: false,
        token: null,
        role: null,
        loading: false,
      },
    }
  );

  render(ui);

  expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
});
test("shows loading screen when auth is loading", () => {
  const { ui } = renderWithStore(
    <ProtectedRoute>
      <DummyPage />
    </ProtectedRoute>,
    {
      auth: {
        isAuthenticated: false,
        token: null,
        role: null,
        loading: true,
      },
    }
  );

  render(ui);

  expect(screen.getByText("Loading authentication...")).toBeInTheDocument();
});
