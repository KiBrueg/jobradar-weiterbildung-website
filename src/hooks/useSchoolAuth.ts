const KEY = "jr_school_token";
const NAME_KEY = "jr_school_name";
const PLAN_KEY = "jr_school_plan";

export interface SchoolUser {
  token: string;
  schoolName: string;
  plan: string;
}

export function getSchoolUser(): SchoolUser | null {
  const token = localStorage.getItem(KEY);
  if (!token) return null;
  return {
    token,
    schoolName: localStorage.getItem(NAME_KEY) || "",
    plan: localStorage.getItem(PLAN_KEY) || "Pilot",
  };
}

export function saveSchoolUser(u: SchoolUser) {
  localStorage.setItem(KEY, u.token);
  localStorage.setItem(NAME_KEY, u.schoolName);
  localStorage.setItem(PLAN_KEY, u.plan);
}

export function clearSchoolUser() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(PLAN_KEY);
}

export function schoolFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(KEY) || "";
  return fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}
