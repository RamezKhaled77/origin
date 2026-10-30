import { AllProjectsDirectory } from "@/components/workspaces/AllProjectsDirectory";
import { MOCK_CROSS_WORKSPACE_PROJECTS } from "@/components/workspaces/mock-data";

export default function AllProjectsPage() {
  return <AllProjectsDirectory workspaces={MOCK_CROSS_WORKSPACE_PROJECTS} />;
}
