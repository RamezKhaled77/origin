import { WorkspaceDirectory } from "@/components/workspaces/WorkspaceDirectory";
import { MOCK_WORKSPACES } from "@/components/workspaces/mock-data";

export default function WorkspacesPage() {
  return <WorkspaceDirectory workspaces={MOCK_WORKSPACES} />;
}
