import { redirect } from 'next/navigation';

export default function NewMemberRedirectPage() {
  redirect('/members?add=true');
}
