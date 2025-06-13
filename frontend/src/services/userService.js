export const fetchUser = async () => {
  try {
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    if (data.error) return null;
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
