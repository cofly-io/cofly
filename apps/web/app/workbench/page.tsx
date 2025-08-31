// 重定向到 home
import { redirect } from 'next/navigation';

export default function WorkbenchPage() {
  redirect('/workbench/home');
}