import DashboardPage from './DashboardPage'

// Backwards-compatible alias: WorksitesPage is now the unified dashboard.
export default function WorksitesPage(props) {
  return <DashboardPage {...props} />
}
