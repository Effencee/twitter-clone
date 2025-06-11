import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await fetch(`/api/users/follow/${id}`, {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["suggestedUsers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["following"],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { mutate, isPending };
};

export default useFollow;
