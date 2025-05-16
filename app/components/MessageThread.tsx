"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_profile?: {
    full_name?: string;
    email?: string;
  };
}

export default function MessageThread({ jobRequestId, recipientId }: { jobRequestId: string; recipientId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    getUserId();
    // Optionally: set up polling or realtime subscription here
    // For now, just fetch on mount
  }, [jobRequestId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserId = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at, sender_profile:sender_id(full_name, email)")
      .eq("job_request_id", jobRequestId)
      .order("created_at", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      const normalized = (data || []).map((msg: any) => ({
        ...msg,
        sender_profile: Array.isArray(msg.sender_profile) ? msg.sender_profile[0] : msg.sender_profile,
      }));
      setMessages(normalized);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;
    setSending(true);
    setError(null);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: sendError } = await supabase
      .from("messages")
      .insert({
        job_request_id: jobRequestId,
        sender_id: userId,
        recipient_id: recipientId,
        content: newMessage.trim(),
      });
    if (sendError) {
      setError(sendError.message);
    } else {
      // Insert notification for recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          job_request_id: jobRequestId,
          message: newMessage.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
        });
      setNewMessage("");
      fetchMessages();
    }
    setSending(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-2">Messages</h3>
      <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 rounded-lg ${msg.sender_id === userId ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'}`}>
                <div className="text-xs font-semibold mb-1">
                  {msg.sender_profile?.full_name || (msg.sender_id === userId ? "You" : "Other")}
                </div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded border px-3 py-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          disabled={sending || !newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 