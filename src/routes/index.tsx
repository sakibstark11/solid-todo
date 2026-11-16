import { Navigate } from '@solidjs/router'
import { store } from '../lib/store'

export default function Index() {
  return <Navigate href={store.currentUser() ? '/todos' : '/login'} />
}
