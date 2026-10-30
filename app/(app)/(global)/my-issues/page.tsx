import { MyIssuesDirectory } from "@/components/issues/MyIssuesDirectory";
import { MOCK_MY_ISSUES } from "@/components/workspaces/mock-data";

export default function MyIssuesPage() {
  return <MyIssuesDirectory issues={MOCK_MY_ISSUES} />;
}
