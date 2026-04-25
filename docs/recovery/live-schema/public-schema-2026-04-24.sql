


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."can_provider_view_pet"("target_pet_id" "uuid", "check_profile_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.bookings b
    join public.providers p on p.id = b.provider_id
    where b.pet_id = target_pet_id
      and p.profile_id = check_profile_id
      and b.status in ('pending', 'accepted', 'completed')
  );
$$;


ALTER FUNCTION "public"."can_provider_view_pet"("target_pet_id" "uuid", "check_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("check_profile_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.profile_roles pr
    where pr.profile_id = check_profile_id
      and pr.role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"("check_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_booking_participant"("target_booking_id" "uuid", "check_profile_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.bookings b
    join public.providers p on p.id = b.provider_id
    where b.id = target_booking_id
      and (
        b.owner_profile_id = check_profile_id
        or p.profile_id = check_profile_id
      )
  );
$$;


ALTER FUNCTION "public"."is_booking_participant"("target_booking_id" "uuid", "check_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."owns_provider"("target_provider_id" "uuid", "check_profile_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.providers p
    where p.id = target_provider_id
      and p.profile_id = check_profile_id
  );
$$;


ALTER FUNCTION "public"."owns_provider"("target_provider_id" "uuid", "check_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_profile_from_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    phone,
    locale,
    status,
    onboarding_state
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'locale', 'hr'),
    'active',
    'created'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        phone = coalesce(excluded.phone, public.profiles.phone),
        locale = coalesce(excluded.locale, public.profiles.locale),
        updated_at = timezone('utc', now());

  insert into public.profile_roles (profile_id, role)
  values (new.id, 'owner')
  on conflict (profile_id, role) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."sync_profile_from_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_conversation_last_message_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      updated_at = timezone('utc', now())
  where id = new.conversation_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."touch_conversation_last_message_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."touch_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."availability_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "service_code" "text",
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "timezone" "text" DEFAULT 'Europe/Zagreb'::"text" NOT NULL,
    "status" "text" DEFAULT 'available'::"text" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "availability_slots_range_valid" CHECK (("ends_at" > "starts_at")),
    CONSTRAINT "availability_slots_service_code_check" CHECK ((("service_code" IS NULL) OR ("service_code" = ANY (ARRAY['boarding'::"text", 'walking'::"text", 'daycare'::"text", 'house_sitting'::"text", 'drop_in'::"text", 'grooming_basic'::"text", 'training_basic'::"text"])))),
    CONSTRAINT "availability_slots_source_check" CHECK (("source" = ANY (ARRAY['manual'::"text", 'booking'::"text", 'google_sync'::"text", 'ical_import'::"text"]))),
    CONSTRAINT "availability_slots_status_check" CHECK (("status" = ANY (ARRAY['available'::"text", 'blocked'::"text", 'reserved'::"text"])))
);


ALTER TABLE "public"."availability_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "service_code" "text" NOT NULL,
    "quantity" numeric(10,2) DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "line_total" numeric(10,2) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "booking_items_line_total_check" CHECK (("line_total" >= (0)::numeric)),
    CONSTRAINT "booking_items_quantity_check" CHECK (("quantity" > (0)::numeric)),
    CONSTRAINT "booking_items_total_match" CHECK (("line_total" >= (0)::numeric)),
    CONSTRAINT "booking_items_unit_price_check" CHECK (("unit_price" >= (0)::numeric))
);


ALTER TABLE "public"."booking_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_slug" "text" NOT NULL,
    "provider_name" "text" NOT NULL,
    "provider_city" "text" NOT NULL,
    "provider_district" "text" NOT NULL,
    "service_label" "text" NOT NULL,
    "price_snapshot" "text" NOT NULL,
    "response_time_snapshot" "text" NOT NULL,
    "mode" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "pet_name" "text" NOT NULL,
    "pet_type" "text" NOT NULL,
    "notes" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "source" "text" DEFAULT 'web_request_flow'::"text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "booking_requests_mode_check" CHECK (("mode" = ANY (ARRAY['overnight'::"text", 'visit'::"text", 'custom'::"text"]))),
    CONSTRAINT "booking_requests_pet_type_check" CHECK (("pet_type" = ANY (ARRAY['pas'::"text", 'macka'::"text", 'ostalo'::"text"]))),
    CONSTRAINT "booking_requests_source_check" CHECK (("source" = 'web_request_flow'::"text")),
    CONSTRAINT "booking_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'accepted'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."booking_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_profile_id" "uuid" NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "provider_kind" "text" NOT NULL,
    "primary_service_code" "text" NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "payment_status" "text" DEFAULT 'unpaid'::"text" NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "subtotal_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "platform_fee_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "owner_note" "text",
    "provider_note" "text",
    "cancellation_reason" "text",
    "accepted_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "bookings_amounts_valid" CHECK (("total_amount" >= "subtotal_amount")),
    CONSTRAINT "bookings_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "bookings_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['unpaid'::"text", 'pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text"]))),
    CONSTRAINT "bookings_platform_fee_amount_check" CHECK (("platform_fee_amount" >= (0)::numeric)),
    CONSTRAINT "bookings_primary_service_code_check" CHECK (("primary_service_code" = ANY (ARRAY['boarding'::"text", 'walking'::"text", 'daycare'::"text", 'house_sitting'::"text", 'drop_in'::"text", 'grooming_basic'::"text", 'training_basic'::"text"]))),
    CONSTRAINT "bookings_provider_kind_check" CHECK (("provider_kind" = ANY (ARRAY['sitter'::"text", 'groomer'::"text", 'trainer'::"text", 'mixed'::"text"]))),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'accepted'::"text", 'rejected'::"text", 'cancelled'::"text", 'completed'::"text"]))),
    CONSTRAINT "bookings_subtotal_amount_check" CHECK (("subtotal_amount" >= (0)::numeric)),
    CONSTRAINT "bookings_time_range_valid" CHECK (("ends_at" > "starts_at")),
    CONSTRAINT "bookings_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "last_read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid",
    "created_by_profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_message_at" timestamp with time zone
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_profile_id" "uuid" NOT NULL,
    "content" "text",
    "image_storage_path" "text",
    "message_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'system'::"text"]))),
    CONSTRAINT "messages_payload_present" CHECK ((("content" IS NOT NULL) OR ("image_storage_path" IS NOT NULL) OR ("message_type" = 'system'::"text")))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "stripe_payment_intent_id" "text",
    "stripe_checkout_session_id" "text",
    "amount" numeric(10,2) NOT NULL,
    "platform_fee_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "raw_provider_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "payments_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "payments_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "payments_platform_fee_amount_check" CHECK (("platform_fee_amount" >= (0)::numeric)),
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'requires_action'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payout_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "payment_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "processed_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "payout_requests_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payout_requests_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "payout_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'paid'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."payout_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pet_passports" (
    "pet_id" "uuid" NOT NULL,
    "notes" "text",
    "vet_name" "text",
    "vet_phone" "text",
    "vet_address" "text",
    "raw_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."pet_passports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_profile_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "species" "text" NOT NULL,
    "breed" "text",
    "sex" "text",
    "birth_date" "date",
    "weight_kg" numeric(6,2),
    "microchip_number" "text",
    "sterilized" boolean DEFAULT false NOT NULL,
    "special_needs" "text",
    "behavior_notes" "text",
    "emergency_contact_name" "text",
    "emergency_contact_phone" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "pets_sex_check" CHECK (("sex" = ANY (ARRAY['male'::"text", 'female'::"text", 'unknown'::"text"]))),
    CONSTRAINT "pets_species_check" CHECK (("species" = ANY (ARRAY['dog'::"text", 'cat'::"text", 'other'::"text"]))),
    CONSTRAINT "pets_weight_kg_check" CHECK ((("weight_kg" IS NULL) OR ("weight_kg" > (0)::numeric)))
);


ALTER TABLE "public"."pets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_roles" (
    "profile_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "granted_by_profile_id" "uuid",
    CONSTRAINT "profile_roles_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'provider'::"text", 'admin'::"text", 'rescue_org'::"text", 'publisher'::"text", 'breeder'::"text"])))
);


ALTER TABLE "public"."profile_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "public"."citext" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "phone" "text",
    "city" "text",
    "locale" "text" DEFAULT 'hr'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "onboarding_state" "text" DEFAULT 'created'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "profiles_locale_check" CHECK ((("char_length"("locale") >= 2) AND ("char_length"("locale") <= 10))),
    CONSTRAINT "profiles_onboarding_state_check" CHECK (("onboarding_state" = ANY (ARRAY['created'::"text", 'profile_completed'::"text", 'provider_started'::"text", 'provider_completed'::"text"]))),
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'deleted'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provider_groomer_settings" (
    "provider_id" "uuid" NOT NULL,
    "specialization" "text",
    "mobile_service" boolean DEFAULT false NOT NULL,
    "working_hours_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."provider_groomer_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provider_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "service_code" "text" NOT NULL,
    "base_price" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "duration_minutes" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "provider_services_base_price_check" CHECK (("base_price" >= (0)::numeric)),
    CONSTRAINT "provider_services_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "provider_services_duration_minutes_check" CHECK ((("duration_minutes" IS NULL) OR ("duration_minutes" > 0))),
    CONSTRAINT "provider_services_service_code_check" CHECK (("service_code" = ANY (ARRAY['boarding'::"text", 'walking'::"text", 'daycare'::"text", 'house_sitting'::"text", 'drop_in'::"text", 'grooming_basic'::"text", 'training_basic'::"text"])))
);


ALTER TABLE "public"."provider_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provider_sitter_settings" (
    "provider_id" "uuid" NOT NULL,
    "home_type" "text",
    "has_yard" boolean DEFAULT false NOT NULL,
    "accepts_small_dogs" boolean DEFAULT true NOT NULL,
    "accepts_large_dogs" boolean DEFAULT true NOT NULL,
    "accepts_cats" boolean DEFAULT false NOT NULL,
    "max_pets_per_day" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "provider_sitter_settings_max_pets_per_day_check" CHECK ((("max_pets_per_day" IS NULL) OR ("max_pets_per_day" > 0)))
);


ALTER TABLE "public"."provider_sitter_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provider_trainer_settings" (
    "provider_id" "uuid" NOT NULL,
    "specializations" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "certified" boolean DEFAULT false NOT NULL,
    "training_location" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."provider_trainer_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "provider_kind" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "bio" "text",
    "city" "text",
    "address" "text",
    "lat" numeric(9,6),
    "lng" numeric(9,6),
    "phone" "text",
    "email" "public"."citext",
    "experience_years" integer,
    "verified_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "public_status" "text" DEFAULT 'hidden'::"text" NOT NULL,
    "response_time_label" "text",
    "rating_avg" numeric(3,2) DEFAULT 0 NOT NULL,
    "review_count" integer DEFAULT 0 NOT NULL,
    "stripe_account_id" "text",
    "stripe_onboarding_complete" boolean DEFAULT false NOT NULL,
    "instant_booking_enabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "providers_experience_years_check" CHECK ((("experience_years" IS NULL) OR ("experience_years" >= 0))),
    CONSTRAINT "providers_provider_kind_check" CHECK (("provider_kind" = ANY (ARRAY['sitter'::"text", 'groomer'::"text", 'trainer'::"text", 'mixed'::"text"]))),
    CONSTRAINT "providers_public_status_check" CHECK (("public_status" = ANY (ARRAY['hidden'::"text", 'listed'::"text"]))),
    CONSTRAINT "providers_rating_avg_check" CHECK ((("rating_avg" >= (0)::numeric) AND ("rating_avg" <= (5)::numeric))),
    CONSTRAINT "providers_review_count_check" CHECK (("review_count" >= 0)),
    CONSTRAINT "providers_verified_status_check" CHECK (("verified_status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'verified'::"text", 'rejected'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "reviewer_profile_id" "uuid" NOT NULL,
    "reviewee_profile_id" "uuid" NOT NULL,
    "provider_id" "uuid",
    "rating" integer NOT NULL,
    "comment" "text",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "reviews_self_review_forbidden" CHECK (("reviewer_profile_id" <> "reviewee_profile_id")),
    CONSTRAINT "reviews_status_check" CHECK (("status" = ANY (ARRAY['published'::"text", 'hidden'::"text", 'flagged'::"text"])))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_availability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trainer_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_availability_time_check" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."trainer_availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trainer_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "program_id" "uuid",
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "pet_name" "text",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'rejected'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "trainer_bookings_time_check" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."trainer_bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trainer_id" "uuid" NOT NULL,
    "author_name" "text" NOT NULL,
    "author_initial" "text" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."trainer_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "city" "text" NOT NULL,
    "specializations" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "price_per_hour" integer DEFAULT 0 NOT NULL,
    "certificates" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "rating" numeric(2,1) DEFAULT 0 NOT NULL,
    "review_count" integer DEFAULT 0 NOT NULL,
    "bio" "text" DEFAULT ''::"text" NOT NULL,
    "certified" boolean DEFAULT false NOT NULL,
    "phone" "text",
    "email" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trainers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trainer_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "duration_weeks" integer DEFAULT 0 NOT NULL,
    "sessions" integer DEFAULT 0 NOT NULL,
    "price" integer DEFAULT 0 NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."training_programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."walk_checkpoints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "walk_id" "uuid" NOT NULL,
    "label" "text",
    "emoji" "text",
    "lat" numeric(9,6),
    "lng" numeric(9,6),
    "recorded_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."walk_checkpoints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."walks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "owner_profile_id" "uuid" NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "distance_km" numeric(8,2),
    "route_geojson" "jsonb",
    "started_by_profile_id" "uuid",
    "ended_by_profile_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "walks_distance_km_check" CHECK ((("distance_km" IS NULL) OR ("distance_km" >= (0)::numeric))),
    CONSTRAINT "walks_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "walks_time_order_valid" CHECK ((("ended_at" IS NULL) OR ("started_at" IS NULL) OR ("ended_at" >= "started_at")))
);


ALTER TABLE "public"."walks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "booking_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_requests"
    ADD CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id", "profile_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_booking_id_key" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_booking_id_key" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_stripe_checkout_session_id_key" UNIQUE ("stripe_checkout_session_id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");



ALTER TABLE ONLY "public"."payout_requests"
    ADD CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pet_passports"
    ADD CONSTRAINT "pet_passports_pkey" PRIMARY KEY ("pet_id");



ALTER TABLE ONLY "public"."pets"
    ADD CONSTRAINT "pets_microchip_unique" UNIQUE ("microchip_number");



ALTER TABLE ONLY "public"."pets"
    ADD CONSTRAINT "pets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_roles"
    ADD CONSTRAINT "profile_roles_pkey" PRIMARY KEY ("profile_id", "role");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provider_groomer_settings"
    ADD CONSTRAINT "provider_groomer_settings_pkey" PRIMARY KEY ("provider_id");



ALTER TABLE ONLY "public"."provider_services"
    ADD CONSTRAINT "provider_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provider_services"
    ADD CONSTRAINT "provider_services_provider_service_unique" UNIQUE ("provider_id", "service_code");



ALTER TABLE ONLY "public"."provider_sitter_settings"
    ADD CONSTRAINT "provider_sitter_settings_pkey" PRIMARY KEY ("provider_id");



ALTER TABLE ONLY "public"."provider_trainer_settings"
    ADD CONSTRAINT "provider_trainer_settings_pkey" PRIMARY KEY ("provider_id");



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_profile_id_display_name_unique" UNIQUE ("profile_id", "display_name");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_unique_reviewer_per_booking" UNIQUE ("booking_id", "reviewer_profile_id");



ALTER TABLE ONLY "public"."trainer_availability"
    ADD CONSTRAINT "trainer_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_availability"
    ADD CONSTRAINT "trainer_availability_unique_slot" UNIQUE ("trainer_id", "date", "start_time");



ALTER TABLE ONLY "public"."trainer_bookings"
    ADD CONSTRAINT "trainer_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_reviews"
    ADD CONSTRAINT "trainer_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainers"
    ADD CONSTRAINT "trainers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_programs"
    ADD CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walk_checkpoints"
    ADD CONSTRAINT "walk_checkpoints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_pkey" PRIMARY KEY ("id");



CREATE INDEX "availability_slots_provider_time_idx" ON "public"."availability_slots" USING "btree" ("provider_id", "starts_at", "ends_at");



CREATE INDEX "availability_slots_service_code_idx" ON "public"."availability_slots" USING "btree" ("service_code");



CREATE INDEX "availability_slots_status_idx" ON "public"."availability_slots" USING "btree" ("status");



CREATE INDEX "booking_items_booking_id_idx" ON "public"."booking_items" USING "btree" ("booking_id");



CREATE INDEX "bookings_owner_profile_id_idx" ON "public"."bookings" USING "btree" ("owner_profile_id");



CREATE INDEX "bookings_pet_id_idx" ON "public"."bookings" USING "btree" ("pet_id");



CREATE INDEX "bookings_provider_id_idx" ON "public"."bookings" USING "btree" ("provider_id");



CREATE INDEX "bookings_provider_status_time_idx" ON "public"."bookings" USING "btree" ("provider_id", "status", "starts_at");



CREATE INDEX "bookings_status_idx" ON "public"."bookings" USING "btree" ("status");



CREATE INDEX "bookings_time_idx" ON "public"."bookings" USING "btree" ("starts_at", "ends_at");



CREATE INDEX "conversation_participants_profile_id_idx" ON "public"."conversation_participants" USING "btree" ("profile_id");



CREATE INDEX "conversations_booking_id_idx" ON "public"."conversations" USING "btree" ("booking_id");



CREATE INDEX "idx_booking_requests_provider_slug" ON "public"."booking_requests" USING "btree" ("provider_slug");



CREATE INDEX "idx_booking_requests_status" ON "public"."booking_requests" USING "btree" ("status");



CREATE INDEX "idx_booking_requests_submitted_at" ON "public"."booking_requests" USING "btree" ("submitted_at" DESC);



CREATE INDEX "idx_trainer_availability_date" ON "public"."trainer_availability" USING "btree" ("date");



CREATE INDEX "idx_trainer_availability_trainer_id" ON "public"."trainer_availability" USING "btree" ("trainer_id");



CREATE INDEX "idx_trainer_bookings_date" ON "public"."trainer_bookings" USING "btree" ("date");



CREATE INDEX "idx_trainer_bookings_status" ON "public"."trainer_bookings" USING "btree" ("status");



CREATE INDEX "idx_trainer_bookings_trainer_id" ON "public"."trainer_bookings" USING "btree" ("trainer_id");



CREATE INDEX "idx_trainer_bookings_user_id" ON "public"."trainer_bookings" USING "btree" ("user_id");



CREATE INDEX "idx_trainer_reviews_created_at" ON "public"."trainer_reviews" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_trainer_reviews_trainer_id" ON "public"."trainer_reviews" USING "btree" ("trainer_id");



CREATE INDEX "idx_trainers_city" ON "public"."trainers" USING "btree" ("city");



CREATE INDEX "idx_trainers_user_id" ON "public"."trainers" USING "btree" ("user_id");



CREATE INDEX "idx_training_programs_trainer_id" ON "public"."training_programs" USING "btree" ("trainer_id");



CREATE INDEX "idx_training_programs_type" ON "public"."training_programs" USING "btree" ("type");



CREATE INDEX "messages_conversation_created_idx" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "messages_sender_profile_id_idx" ON "public"."messages" USING "btree" ("sender_profile_id");



CREATE INDEX "payments_provider_id_idx" ON "public"."payments" USING "btree" ("provider_id");



CREATE INDEX "payments_status_idx" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "payout_requests_provider_status_idx" ON "public"."payout_requests" USING "btree" ("provider_id", "status");



CREATE INDEX "pets_is_active_idx" ON "public"."pets" USING "btree" ("is_active");



CREATE INDEX "pets_owner_profile_id_idx" ON "public"."pets" USING "btree" ("owner_profile_id");



CREATE INDEX "pets_species_idx" ON "public"."pets" USING "btree" ("species");



CREATE INDEX "profile_roles_role_idx" ON "public"."profile_roles" USING "btree" ("role");



CREATE INDEX "profiles_city_idx" ON "public"."profiles" USING "btree" ("city");



CREATE INDEX "profiles_status_idx" ON "public"."profiles" USING "btree" ("status");



CREATE INDEX "provider_services_active_idx" ON "public"."provider_services" USING "btree" ("is_active");



CREATE INDEX "provider_services_provider_id_idx" ON "public"."provider_services" USING "btree" ("provider_id");



CREATE INDEX "providers_city_idx" ON "public"."providers" USING "btree" ("city");



CREATE INDEX "providers_kind_status_idx" ON "public"."providers" USING "btree" ("provider_kind", "verified_status", "public_status");



CREATE INDEX "providers_profile_id_idx" ON "public"."providers" USING "btree" ("profile_id");



CREATE INDEX "providers_public_rating_idx" ON "public"."providers" USING "btree" ("public_status", "rating_avg" DESC, "review_count" DESC);



CREATE INDEX "reviews_provider_id_idx" ON "public"."reviews" USING "btree" ("provider_id");



CREATE INDEX "reviews_reviewee_status_idx" ON "public"."reviews" USING "btree" ("reviewee_profile_id", "status", "created_at" DESC);



CREATE INDEX "walk_checkpoints_walk_recorded_idx" ON "public"."walk_checkpoints" USING "btree" ("walk_id", "recorded_at");



CREATE INDEX "walks_booking_id_idx" ON "public"."walks" USING "btree" ("booking_id");



CREATE INDEX "walks_provider_id_idx" ON "public"."walks" USING "btree" ("provider_id");



CREATE OR REPLACE TRIGGER "availability_slots_set_updated_at" BEFORE UPDATE ON "public"."availability_slots" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "bookings_set_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "conversations_set_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "messages_touch_conversations" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."touch_conversation_last_message_at"();



CREATE OR REPLACE TRIGGER "payments_set_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "payout_requests_set_updated_at" BEFORE UPDATE ON "public"."payout_requests" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "pet_passports_set_updated_at" BEFORE UPDATE ON "public"."pet_passports" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "pets_set_updated_at" BEFORE UPDATE ON "public"."pets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "provider_groomer_settings_set_updated_at" BEFORE UPDATE ON "public"."provider_groomer_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "provider_services_set_updated_at" BEFORE UPDATE ON "public"."provider_services" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "provider_sitter_settings_set_updated_at" BEFORE UPDATE ON "public"."provider_sitter_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "provider_trainer_settings_set_updated_at" BEFORE UPDATE ON "public"."provider_trainer_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "providers_set_updated_at" BEFORE UPDATE ON "public"."providers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "reviews_set_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trainer_availability_touch_updated_at" BEFORE UPDATE ON "public"."trainer_availability" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trainer_bookings_touch_updated_at" BEFORE UPDATE ON "public"."trainer_bookings" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trainers_touch_updated_at" BEFORE UPDATE ON "public"."trainers" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "training_programs_touch_updated_at" BEFORE UPDATE ON "public"."training_programs" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "walks_set_updated_at" BEFORE UPDATE ON "public"."walks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "booking_items_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_profile_id_fkey" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_profile_id_fkey" FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payout_requests"
    ADD CONSTRAINT "payout_requests_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payout_requests"
    ADD CONSTRAINT "payout_requests_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pet_passports"
    ADD CONSTRAINT "pet_passports_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pets"
    ADD CONSTRAINT "pets_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_roles"
    ADD CONSTRAINT "profile_roles_granted_by_profile_id_fkey" FOREIGN KEY ("granted_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profile_roles"
    ADD CONSTRAINT "profile_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."provider_groomer_settings"
    ADD CONSTRAINT "provider_groomer_settings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."provider_services"
    ADD CONSTRAINT "provider_services_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."provider_sitter_settings"
    ADD CONSTRAINT "provider_sitter_settings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."provider_trainer_settings"
    ADD CONSTRAINT "provider_trainer_settings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."providers"
    ADD CONSTRAINT "providers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewee_profile_id_fkey" FOREIGN KEY ("reviewee_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_profile_id_fkey" FOREIGN KEY ("reviewer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."trainer_availability"
    ADD CONSTRAINT "trainer_availability_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_bookings"
    ADD CONSTRAINT "trainer_bookings_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trainer_bookings"
    ADD CONSTRAINT "trainer_bookings_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_bookings"
    ADD CONSTRAINT "trainer_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trainer_reviews"
    ADD CONSTRAINT "trainer_reviews_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainers"
    ADD CONSTRAINT "trainers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."training_programs"
    ADD CONSTRAINT "training_programs_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walk_checkpoints"
    ADD CONSTRAINT "walk_checkpoints_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "public"."walks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_ended_by_profile_id_fkey" FOREIGN KEY ("ended_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."walks"
    ADD CONSTRAINT "walks_started_by_profile_id_fkey" FOREIGN KEY ("started_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE "public"."availability_slots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "availability_slots_manage_owner_or_admin" ON "public"."availability_slots" USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "availability_slots_public_select_or_owner_or_admin" ON "public"."availability_slots" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."providers" "p"
  WHERE (("p"."id" = "availability_slots"."provider_id") AND ((("p"."public_status" = 'listed'::"text") AND ("p"."verified_status" = 'verified'::"text") AND ("availability_slots"."status" = 'available'::"text")) OR ("p"."profile_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."booking_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "booking_items_manage_owner_provider_or_admin" ON "public"."booking_items" USING (("public"."is_booking_participant"("booking_id") OR "public"."is_admin"())) WITH CHECK (("public"."is_booking_participant"("booking_id") OR "public"."is_admin"()));



CREATE POLICY "booking_items_select_participant_or_admin" ON "public"."booking_items" FOR SELECT USING (("public"."is_booking_participant"("booking_id") OR "public"."is_admin"()));



ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bookings_insert_owner_or_admin" ON "public"."bookings" FOR INSERT WITH CHECK (((("owner_profile_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."pets" "pet"
  WHERE (("pet"."id" = "bookings"."pet_id") AND ("pet"."owner_profile_id" = "auth"."uid"()))))) OR "public"."is_admin"()));



CREATE POLICY "bookings_select_participant_or_admin" ON "public"."bookings" FOR SELECT USING ((("owner_profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."providers" "p"
  WHERE (("p"."id" = "bookings"."provider_id") AND ("p"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "bookings_update_participant_or_admin" ON "public"."bookings" FOR UPDATE USING ((("owner_profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."providers" "p"
  WHERE (("p"."id" = "bookings"."provider_id") AND ("p"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"())) WITH CHECK ((("owner_profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."providers" "p"
  WHERE (("p"."id" = "bookings"."provider_id") AND ("p"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversation_participants_manage_conversation_member_or_admin" ON "public"."conversation_participants" USING ((("profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversation_participants"."conversation_id") AND ("cp"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"())) WITH CHECK ((("profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversation_participants"."conversation_id") AND ("cp"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "conversation_participants_select_self_or_admin" ON "public"."conversation_participants" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_insert_creator_or_admin" ON "public"."conversations" FOR INSERT WITH CHECK ((("created_by_profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "conversations_select_participants_or_admin" ON "public"."conversations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."id") AND ("cp"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "conversations_update_participant_or_admin" ON "public"."conversations" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."id") AND ("cp"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"())) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."id") AND ("cp"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_insert_participants_or_admin" ON "public"."messages" FOR INSERT WITH CHECK (((("sender_profile_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."profile_id" = "auth"."uid"()))))) OR "public"."is_admin"()));



CREATE POLICY "messages_select_participants_or_admin" ON "public"."messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "messages_update_sender_or_admin" ON "public"."messages" FOR UPDATE USING ((("sender_profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("sender_profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_manage_provider_or_admin" ON "public"."payments" USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "payments_select_participant_or_admin" ON "public"."payments" FOR SELECT USING (("public"."is_booking_participant"("booking_id") OR "public"."is_admin"()));



ALTER TABLE "public"."payout_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payout_requests_insert_owner_or_admin" ON "public"."payout_requests" FOR INSERT WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "payout_requests_select_owner_or_admin" ON "public"."payout_requests" FOR SELECT USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "payout_requests_update_admin_only" ON "public"."payout_requests" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."pet_passports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pet_passports_delete_owner_or_admin" ON "public"."pet_passports" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."pets" "p"
  WHERE (("p"."id" = "pet_passports"."pet_id") AND ("p"."owner_profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "pet_passports_insert_owner_or_admin" ON "public"."pet_passports" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."pets" "p"
  WHERE (("p"."id" = "pet_passports"."pet_id") AND ("p"."owner_profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



CREATE POLICY "pet_passports_select_owner_provider_or_admin" ON "public"."pet_passports" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."pets" "p"
  WHERE (("p"."id" = "pet_passports"."pet_id") AND (("p"."owner_profile_id" = "auth"."uid"()) OR "public"."can_provider_view_pet"("p"."id"))))) OR "public"."is_admin"()));



CREATE POLICY "pet_passports_update_owner_or_admin" ON "public"."pet_passports" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."pets" "p"
  WHERE (("p"."id" = "pet_passports"."pet_id") AND ("p"."owner_profile_id" = "auth"."uid"())))) OR "public"."is_admin"())) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."pets" "p"
  WHERE (("p"."id" = "pet_passports"."pet_id") AND ("p"."owner_profile_id" = "auth"."uid"())))) OR "public"."is_admin"()));



ALTER TABLE "public"."pets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pets_delete_owner_or_admin" ON "public"."pets" FOR DELETE USING ((("auth"."uid"() = "owner_profile_id") OR "public"."is_admin"()));



CREATE POLICY "pets_insert_owner_or_admin" ON "public"."pets" FOR INSERT WITH CHECK ((("auth"."uid"() = "owner_profile_id") OR "public"."is_admin"()));



CREATE POLICY "pets_select_owner_provider_or_admin" ON "public"."pets" FOR SELECT USING ((("auth"."uid"() = "owner_profile_id") OR "public"."can_provider_view_pet"("id") OR "public"."is_admin"()));



CREATE POLICY "pets_update_owner_or_admin" ON "public"."pets" FOR UPDATE USING ((("auth"."uid"() = "owner_profile_id") OR "public"."is_admin"())) WITH CHECK ((("auth"."uid"() = "owner_profile_id") OR "public"."is_admin"()));



ALTER TABLE "public"."profile_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profile_roles_manage_admin_only" ON "public"."profile_roles" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "profile_roles_select_self_or_admin" ON "public"."profile_roles" FOR SELECT USING ((("auth"."uid"() = "profile_id") OR "public"."is_admin"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_self" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_self_or_admin" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



CREATE POLICY "profiles_update_self_or_admin" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR "public"."is_admin"())) WITH CHECK ((("auth"."uid"() = "id") OR "public"."is_admin"()));



ALTER TABLE "public"."provider_groomer_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "provider_groomer_settings_manage_owner_or_admin" ON "public"."provider_groomer_settings" USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "provider_groomer_settings_select_owner_or_admin" ON "public"."provider_groomer_settings" FOR SELECT USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



ALTER TABLE "public"."provider_services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "provider_services_manage_owner_or_admin" ON "public"."provider_services" USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "provider_services_public_select_or_owner_or_admin" ON "public"."provider_services" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."providers" "p"
  WHERE (("p"."id" = "provider_services"."provider_id") AND ((("p"."public_status" = 'listed'::"text") AND ("p"."verified_status" = 'verified'::"text")) OR ("p"."profile_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."provider_sitter_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "provider_sitter_settings_manage_owner_or_admin" ON "public"."provider_sitter_settings" USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "provider_sitter_settings_select_owner_or_admin" ON "public"."provider_sitter_settings" FOR SELECT USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



ALTER TABLE "public"."provider_trainer_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "provider_trainer_settings_manage_owner_or_admin" ON "public"."provider_trainer_settings" USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "provider_trainer_settings_select_owner_or_admin" ON "public"."provider_trainer_settings" FOR SELECT USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



ALTER TABLE "public"."providers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "providers_delete_owner_or_admin" ON "public"."providers" FOR DELETE USING ((("auth"."uid"() = "profile_id") OR "public"."is_admin"()));



CREATE POLICY "providers_insert_owner_or_admin" ON "public"."providers" FOR INSERT WITH CHECK ((("auth"."uid"() = "profile_id") OR "public"."is_admin"()));



CREATE POLICY "providers_public_select_or_owner_or_admin" ON "public"."providers" FOR SELECT USING (((("public_status" = 'listed'::"text") AND ("verified_status" = 'verified'::"text")) OR ("auth"."uid"() = "profile_id") OR "public"."is_admin"()));



CREATE POLICY "providers_update_owner_or_admin" ON "public"."providers" FOR UPDATE USING ((("auth"."uid"() = "profile_id") OR "public"."is_admin"())) WITH CHECK ((("auth"."uid"() = "profile_id") OR "public"."is_admin"()));



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_insert_completed_booking_participant_or_admin" ON "public"."reviews" FOR INSERT WITH CHECK (((("reviewer_profile_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."bookings" "b"
     JOIN "public"."providers" "p" ON (("p"."id" = "b"."provider_id")))
  WHERE (("b"."id" = "reviews"."booking_id") AND ("b"."status" = 'completed'::"text") AND ((("b"."owner_profile_id" = "auth"."uid"()) AND ("p"."profile_id" = "reviews"."reviewee_profile_id")) OR (("p"."profile_id" = "auth"."uid"()) AND ("b"."owner_profile_id" = "reviews"."reviewee_profile_id"))))))) OR "public"."is_admin"()));



CREATE POLICY "reviews_public_or_participant_or_admin" ON "public"."reviews" FOR SELECT USING ((("status" = 'published'::"text") OR ("reviewer_profile_id" = "auth"."uid"()) OR ("reviewee_profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "reviews_update_author_or_admin" ON "public"."reviews" FOR UPDATE USING ((("reviewer_profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("reviewer_profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."walk_checkpoints" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "walk_checkpoints_insert_provider_or_admin" ON "public"."walk_checkpoints" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."walks" "w"
  WHERE (("w"."id" = "walk_checkpoints"."walk_id") AND ("public"."owns_provider"("w"."provider_id") OR "public"."is_admin"())))));



CREATE POLICY "walk_checkpoints_select_walk_participant_or_admin" ON "public"."walk_checkpoints" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."walks" "w"
  WHERE (("w"."id" = "walk_checkpoints"."walk_id") AND (("w"."owner_profile_id" = "auth"."uid"()) OR "public"."owns_provider"("w"."provider_id") OR "public"."is_admin"())))));



ALTER TABLE "public"."walks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "walks_insert_provider_or_admin" ON "public"."walks" FOR INSERT WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "walks_select_participant_or_admin" ON "public"."walks" FOR SELECT USING ((("owner_profile_id" = "auth"."uid"()) OR "public"."owns_provider"("provider_id") OR "public"."is_admin"()));



CREATE POLICY "walks_update_provider_or_admin" ON "public"."walks" FOR UPDATE USING (("public"."owns_provider"("provider_id") OR "public"."is_admin"())) WITH CHECK (("public"."owns_provider"("provider_id") OR "public"."is_admin"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."can_provider_view_pet"("target_pet_id" "uuid", "check_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_provider_view_pet"("target_pet_id" "uuid", "check_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_provider_view_pet"("target_pet_id" "uuid", "check_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("check_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("check_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("check_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_booking_participant"("target_booking_id" "uuid", "check_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_booking_participant"("target_booking_id" "uuid", "check_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_booking_participant"("target_booking_id" "uuid", "check_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."owns_provider"("target_provider_id" "uuid", "check_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."owns_provider"("target_provider_id" "uuid", "check_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."owns_provider"("target_provider_id" "uuid", "check_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_profile_from_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_profile_from_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_profile_from_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_conversation_last_message_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_conversation_last_message_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_conversation_last_message_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."availability_slots" TO "anon";
GRANT ALL ON TABLE "public"."availability_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_slots" TO "service_role";



GRANT ALL ON TABLE "public"."booking_items" TO "anon";
GRANT ALL ON TABLE "public"."booking_items" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_items" TO "service_role";



GRANT ALL ON TABLE "public"."booking_requests" TO "anon";
GRANT ALL ON TABLE "public"."booking_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_requests" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."payout_requests" TO "anon";
GRANT ALL ON TABLE "public"."payout_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_requests" TO "service_role";



GRANT ALL ON TABLE "public"."pet_passports" TO "anon";
GRANT ALL ON TABLE "public"."pet_passports" TO "authenticated";
GRANT ALL ON TABLE "public"."pet_passports" TO "service_role";



GRANT ALL ON TABLE "public"."pets" TO "anon";
GRANT ALL ON TABLE "public"."pets" TO "authenticated";
GRANT ALL ON TABLE "public"."pets" TO "service_role";



GRANT ALL ON TABLE "public"."profile_roles" TO "anon";
GRANT ALL ON TABLE "public"."profile_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_roles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."provider_groomer_settings" TO "anon";
GRANT ALL ON TABLE "public"."provider_groomer_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."provider_groomer_settings" TO "service_role";



GRANT ALL ON TABLE "public"."provider_services" TO "anon";
GRANT ALL ON TABLE "public"."provider_services" TO "authenticated";
GRANT ALL ON TABLE "public"."provider_services" TO "service_role";



GRANT ALL ON TABLE "public"."provider_sitter_settings" TO "anon";
GRANT ALL ON TABLE "public"."provider_sitter_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."provider_sitter_settings" TO "service_role";



GRANT ALL ON TABLE "public"."provider_trainer_settings" TO "anon";
GRANT ALL ON TABLE "public"."provider_trainer_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."provider_trainer_settings" TO "service_role";



GRANT ALL ON TABLE "public"."providers" TO "anon";
GRANT ALL ON TABLE "public"."providers" TO "authenticated";
GRANT ALL ON TABLE "public"."providers" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_availability" TO "anon";
GRANT ALL ON TABLE "public"."trainer_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_availability" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_bookings" TO "anon";
GRANT ALL ON TABLE "public"."trainer_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_bookings" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_reviews" TO "anon";
GRANT ALL ON TABLE "public"."trainer_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."trainers" TO "anon";
GRANT ALL ON TABLE "public"."trainers" TO "authenticated";
GRANT ALL ON TABLE "public"."trainers" TO "service_role";



GRANT ALL ON TABLE "public"."training_programs" TO "anon";
GRANT ALL ON TABLE "public"."training_programs" TO "authenticated";
GRANT ALL ON TABLE "public"."training_programs" TO "service_role";



GRANT ALL ON TABLE "public"."walk_checkpoints" TO "anon";
GRANT ALL ON TABLE "public"."walk_checkpoints" TO "authenticated";
GRANT ALL ON TABLE "public"."walk_checkpoints" TO "service_role";



GRANT ALL ON TABLE "public"."walks" TO "anon";
GRANT ALL ON TABLE "public"."walks" TO "authenticated";
GRANT ALL ON TABLE "public"."walks" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







