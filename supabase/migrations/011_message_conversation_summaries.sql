create or replace function public.get_message_conversation_summaries(p_user_id uuid)
returns table (
  partner_id uuid,
  partner_name text,
  partner_avatar text,
  last_message_id uuid,
  last_message_sender_id uuid,
  last_message_receiver_id uuid,
  last_message_booking_id uuid,
  last_message_content text,
  last_message_image_url text,
  last_message_read boolean,
  last_message_created_at timestamptz,
  unread_count bigint
)
language sql
security definer
set search_path = public
as $$
  with user_messages as (
    select
      m.*,
      case
        when m.sender_id = p_user_id then m.receiver_id
        else m.sender_id
      end as partner_id
    from public.messages m
    where m.sender_id = p_user_id or m.receiver_id = p_user_id
  ),
  ranked_messages as (
    select
      um.*,
      row_number() over (
        partition by um.partner_id
        order by um.created_at desc, um.id desc
      ) as rn
    from user_messages um
  ),
  unread_counts as (
    select
      um.partner_id,
      count(*)::bigint as unread_count
    from user_messages um
    where um.receiver_id = p_user_id and coalesce(um.read, false) = false
    group by um.partner_id
  )
  select
    rm.partner_id,
    u.name as partner_name,
    u.avatar_url as partner_avatar,
    rm.id as last_message_id,
    rm.sender_id as last_message_sender_id,
    rm.receiver_id as last_message_receiver_id,
    rm.booking_id as last_message_booking_id,
    rm.content as last_message_content,
    rm.image_url as last_message_image_url,
    rm.read as last_message_read,
    rm.created_at as last_message_created_at,
    coalesce(uc.unread_count, 0) as unread_count
  from ranked_messages rm
  left join public.users u on u.id = rm.partner_id
  left join unread_counts uc on uc.partner_id = rm.partner_id
  where rm.rn = 1
  order by rm.created_at desc, rm.id desc;
$$;

grant execute on function public.get_message_conversation_summaries(uuid) to authenticated;

drop index if exists public.idx_messages_participants;
create index if not exists idx_messages_user_created_at
  on public.messages (sender_id, created_at desc);
create index if not exists idx_messages_receiver_created_at
  on public.messages (receiver_id, created_at desc);
create index if not exists idx_messages_unread_receiver_sender
  on public.messages (receiver_id, sender_id, created_at desc)
  where read = false;
