"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MessageThread from "@/app/components/MessageThread";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  job_request_id: string;
  other_party_name: string;
  other_party_id: string;
  last_message: string;
  last_message_time: string;
  unread: boolean;
}

export default function MessagesInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const jobRequestIdParam = searchParams.get('jobRequestId');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (jobRequestIdParam && conversations.length > 0) {
      const convo = conversations.find(c => c.job_request_id === jobRequestIdParam);
      if (convo) setSelected(convo);
    }
  }, [jobRequestIdParam, conversations]);

  const fetchConversations = async () => {
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    // Get all job requests where user is owner or mechanic
    const { data: jobRequests } = await supabase
      .from("job_requests")
      .select("id, user_id, mechanic_id, created_at, mechanic_profile:mechanics(business_name), owner_profile:profiles(full_name)")
      .or(`user_id.eq.${user.id},mechanic_id.eq.${user.id}`);
    if (!jobRequests) {
      setConversations([]);
      setLoading(false);
      return;
    }
    // For each job request, get the last message (or allow new message)
    const convos: Conversation[] = [];
    for (const jr of jobRequests) {
      // Normalize joined profiles
      const mechanicProfile = Array.isArray(jr.mechanic_profile) ? jr.mechanic_profile[0] : jr.mechanic_profile;
      const ownerProfile = Array.isArray(jr.owner_profile) ? jr.owner_profile[0] : jr.owner_profile;
      const { data: messages } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("job_request_id", jr.id)
        .order("created_at", { ascending: false })
        .limit(1);
      // Determine the other party
      let other_party_id = user.id === jr.user_id ? jr.mechanic_id : jr.user_id;
      let other_party_name = user.id === jr.user_id
        ? (mechanicProfile?.business_name || "Mechanic")
        : (ownerProfile?.full_name || "Car Owner");
      // Check for unread messages
      const { data: unreadMsgs } = await supabase
        .from("messages")
        .select("id")
        .eq("job_request_id", jr.id)
        .neq("sender_id", user.id)
        .order("created_at", { ascending: false });
      const unread = !!(unreadMsgs && unreadMsgs.length > 0);
      convos.push({
        job_request_id: jr.id,
        other_party_name,
        other_party_id,
        last_message: messages && messages.length > 0 ? messages[0].content : '',
        last_message_time: messages && messages.length > 0 ? messages[0].created_at : jr.created_at,
        unread,
      });
    }
    // Sort by last message time desc
    convos.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
    setConversations(convos);
    setLoading(false);
  };

  return (
    <div className="section-container flex gap-8">
      <div className="w-1/3">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 luxury-card p-6">
            <p className="mb-4">No conversations yet.</p>
            <p className="mb-4">Start by finding a mechanic to request service.</p>
            <Link 
              href="/findmechanics" 
              className="btn-primary inline-block py-3 px-6 rounded-lg text-base font-medium hover-lift"
            >
              Find Mechanics
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.job_request_id}
                className={`w-full text-left p-4 rounded-lg border hover:bg-blue-50 transition-all duration-200 ${selected?.job_request_id === c.job_request_id ? 'bg-blue-100 border-blue-200' : 'bg-white luxury-card'}`}
                onClick={() => setSelected(c)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold">{c.other_party_name}</div>
                  {c.unread && <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">New</span>}
                </div>
                <div className="text-sm text-gray-700 truncate">{c.last_message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(c.last_message_time).toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 luxury-card p-4">
        {selected ? (
          <MessageThread jobRequestId={selected.job_request_id} recipientId={selected.other_party_id} />
        ) : (
          <div className="text-gray-400 text-center mt-24">Select a conversation to view messages</div>
        )}
      </div>
    </div>
  );
} 