import CRMShell from '@/components/CRMShell'
import { CRMProvider } from '@/components/providers/CRMProvider'

export default function DashboardPage() {
  return (
    <CRMProvider>
      <CRMShell />
    </CRMProvider>
  )
}
