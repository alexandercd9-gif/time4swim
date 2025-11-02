"use client";
import { useEffect, useState } from "react";
import { Stopwatch } from "@/components/stopwatch";

export default function SwimmerSelectStopwatch() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/swimmers")
      .then((res) => res.json())
      .then((data) => {
        setChildren(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando nadadores...</div>;

  return <Stopwatch swimmers={children} />;
}
