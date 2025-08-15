

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."gender" AS ENUM (
    'M',
    'F'
);


ALTER TYPE "public"."gender" OWNER TO "postgres";


CREATE TYPE "public"."legal_status" AS ENUM (
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE "public"."legal_status" OWNER TO "postgres";


CREATE TYPE "public"."nutrition_status" AS ENUM (
    'normal',
    'malnourished',
    'severely_malnourished'
);


ALTER TYPE "public"."nutrition_status" OWNER TO "postgres";


CREATE TYPE "public"."parent_status" AS ENUM (
    'total_orphan',
    'partial_orphan',
    'abandoned'
);


ALTER TYPE "public"."parent_status" OWNER TO "postgres";


CREATE TYPE "public"."sync_status" AS ENUM (
    'pending',
    'success',
    'failed'
);


ALTER TYPE "public"."sync_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'orphelinat',
    'partner'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_bmi"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL THEN
    NEW.bmi = NEW.weight_kg / POWER(NEW.height_cm / 100, 2);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_bmi"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_entity_id" "uuid" DEFAULT NULL::"uuid", "notification_entity_type" "text" DEFAULT NULL::"text", "notification_priority" "text" DEFAULT 'medium'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    entity_id,
    entity_type,
    priority
  )
  VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_entity_id,
    notification_entity_type,
    notification_priority
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_entity_id" "uuid", "notification_entity_type" "text", "notification_priority" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_account"("user_email" "text", "user_password" "text", "user_role" "public"."user_role" DEFAULT 'orphelinat'::"public"."user_role", "orphanage_id_param" "uuid" DEFAULT NULL::"uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Insérer dans auth.users avec email_confirmed = true
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_sent_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now()
  )
  RETURNING id INTO new_user_id;

  -- Insérer dans public.users
  INSERT INTO public.users (id, email, role, is_verified)
  VALUES (new_user_id, user_email, user_role, true);

  -- Si c'est pour un orphelinat, créer le lien
  IF orphanage_id_param IS NOT NULL THEN
    INSERT INTO public.user_orphanage_links (user_id, orphanage_id)
    VALUES (new_user_id, orphanage_id_param);
  END IF;

  result := json_build_object(
    'user_id', new_user_id,
    'email', user_email,
    'success', true
  );

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_user_account"("user_email" "text", "user_password" "text", "user_role" "public"."user_role", "orphanage_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_partner_access"("action_type" "text", "resource_accessed" "text" DEFAULT NULL::"text", "user_ip" "inet" DEFAULT NULL::"inet", "user_agent_string" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est un partenaire
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'partner'
  ) THEN
    RAISE EXCEPTION 'Accès refusé: utilisateur non autorisé';
  END IF;
  
  INSERT INTO public.partner_access_logs (
    user_id,
    action,
    resource,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    action_type,
    resource_accessed,
    user_ip,
    user_agent_string
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;


ALTER FUNCTION "public"."log_partner_access"("action_type" "text", "resource_accessed" "text", "user_ip" "inet", "user_agent_string" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_default_username"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.username IS NULL THEN
        NEW.username := NEW.phone;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_default_username"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_orphanage_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT orphanage_id 
  FROM public.user_orphanage_links 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;


ALTER FUNCTION "public"."user_orphanage_id"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."alert_thresholds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "capacity_warning_percentage" integer DEFAULT 80 NOT NULL,
    "capacity_critical_percentage" integer DEFAULT 95 NOT NULL,
    "document_expiry_warning_days" integer DEFAULT 30 NOT NULL,
    "document_expiry_critical_days" integer DEFAULT 7 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "disease_outbreak_threshold" integer DEFAULT 5 NOT NULL,
    "unvaccinated_children_threshold" integer DEFAULT 10 NOT NULL
);


ALTER TABLE "public"."alert_thresholds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."child_diseases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "child_id" "uuid" NOT NULL,
    "disease_id" "uuid" NOT NULL,
    "health_record_id" "uuid" NOT NULL,
    "diagnosed_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "severity" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "child_diseases_severity_check" CHECK (("severity" = ANY (ARRAY['mild'::"text", 'moderate'::"text", 'severe'::"text"])))
);


ALTER TABLE "public"."child_diseases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."children" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "orphanage_id" "uuid",
    "full_name" "text" NOT NULL,
    "gender" "public"."gender" NOT NULL,
    "birth_date" "date",
    "estimated_age" integer,
    "entry_date" "date" DEFAULT CURRENT_DATE,
    "photo_url" "text",
    "parent_status" "public"."parent_status" NOT NULL,
    "internal_code" "text",
    "dhis2_tracked_entity_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_age_or_birth_date" CHECK ((("birth_date" IS NOT NULL) OR ("estimated_age" IS NOT NULL)))
);

ALTER TABLE ONLY "public"."children" REPLICA IDENTITY FULL;


ALTER TABLE "public"."children" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "province_id" "uuid",
    "type" "text" DEFAULT 'city'::"text",
    "population" bigint,
    "is_capital" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orphanages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "province" "text" NOT NULL,
    "city" "text" NOT NULL,
    "province_id" "uuid",
    "city_id" "uuid",
    "address" "text",
    "location_gps" "point",
    "contact_person" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "description" "text",
    "legal_status" "public"."legal_status" DEFAULT 'pending'::"public"."legal_status",
    "documents" "jsonb" DEFAULT '{}'::"jsonb",
    "photo_url" "text",
    "dhis2_orgunit_id" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "child_capacity" integer,
    "children_total" integer,
    "boys_count" integer,
    "girls_count" integer,
    "schooling_rate" numeric(5,2),
    "annual_disease_rate" numeric(5,2),
    "meals_per_day" integer,
    CONSTRAINT "orphanages_child_capacity_check" CHECK (("child_capacity" >= 0))
);

ALTER TABLE ONLY "public"."orphanages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."orphanages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provinces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "capital" "text" NOT NULL,
    "population" bigint,
    "area_km2" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."provinces" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."city_stats" AS
 SELECT "p"."name" AS "province",
    "ci"."name" AS "city",
    "ci"."type" AS "city_type",
    "count"(DISTINCT "o"."id") AS "orphanages_count",
    "count"(DISTINCT "c"."id") AS "children_count"
   FROM ((("public"."provinces" "p"
     JOIN "public"."cities" "ci" ON (("p"."id" = "ci"."province_id")))
     LEFT JOIN "public"."orphanages" "o" ON ((("ci"."id" = "o"."city_id") AND ("o"."legal_status" = 'verified'::"public"."legal_status"))))
     LEFT JOIN "public"."children" "c" ON (("o"."id" = "c"."orphanage_id")))
  GROUP BY "p"."id", "p"."name", "ci"."id", "ci"."name", "ci"."type"
  ORDER BY "p"."name", "ci"."name";


ALTER TABLE "public"."city_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dhis2_sync_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "status" "public"."sync_status" DEFAULT 'pending'::"public"."sync_status",
    "payload" "jsonb",
    "response" "jsonb",
    "error_message" "text",
    "synced_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dhis2_sync_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."diseases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."diseases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "child_id" "uuid",
    "date" "date" DEFAULT CURRENT_DATE,
    "vaccination_status" "text" DEFAULT ''::"text",
    "chronic_conditions" "text" DEFAULT ''::"text",
    "medications" "text" DEFAULT ''::"text",
    "remarks" "text" DEFAULT ''::"text",
    "dhis2_event_id" "text",
    "synced" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "vaccination_status_structured" "jsonb" DEFAULT '{"status": "unknown", "vaccines": [], "last_updated": null}'::"jsonb"
);


ALTER TABLE "public"."health_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "city_id" "uuid",
    "dhis2_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."health_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "orphanage_pending_enabled" boolean DEFAULT true NOT NULL,
    "malnutrition_alerts_enabled" boolean DEFAULT true NOT NULL,
    "document_expiry_enabled" boolean DEFAULT true NOT NULL,
    "capacity_alerts_enabled" boolean DEFAULT true NOT NULL,
    "email_notifications_enabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "entity_id" "uuid",
    "entity_type" "text",
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nutrition_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "child_id" "uuid",
    "date" "date" DEFAULT CURRENT_DATE,
    "weight_kg" numeric(5,2),
    "height_cm" numeric(5,2),
    "bmi" numeric(4,2),
    "nutrition_status" "public"."nutrition_status" DEFAULT 'normal'::"public"."nutrition_status",
    "dhis2_event_id" "text",
    "synced" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_height_positive" CHECK ((("height_cm" IS NULL) OR ("height_cm" > (0)::numeric))),
    CONSTRAINT "check_weight_positive" CHECK ((("weight_kg" IS NULL) OR ("weight_kg" > (0)::numeric)))
);


ALTER TABLE "public"."nutrition_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orphanage_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "orphanage_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_url" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "file_type" "text" NOT NULL,
    "expiry_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "orphanage_documents_document_type_check" CHECK (("document_type" = ANY (ARRAY['agrément'::"text", 'statuts'::"text", 'autorisation'::"text", 'certificat'::"text", 'autre'::"text"])))
);


ALTER TABLE "public"."orphanage_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partner_access_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "resource" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."partner_access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partner_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_name" "text" NOT NULL,
    "organization_type" "text" NOT NULL,
    "contact_person" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "description" "text",
    "purpose" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "partner_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."partner_requests" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."province_stats" AS
 SELECT "p"."name" AS "province",
    "p"."code" AS "province_code",
    "count"(DISTINCT "o"."id") AS "orphanages_count",
    "count"(DISTINCT "c"."id") AS "children_count",
    "count"(DISTINCT
        CASE
            WHEN ("nr"."nutrition_status" = 'normal'::"public"."nutrition_status") THEN "c"."id"
            ELSE NULL::"uuid"
        END) AS "well_nourished",
    "count"(DISTINCT
        CASE
            WHEN ("nr"."nutrition_status" = ANY (ARRAY['malnourished'::"public"."nutrition_status", 'severely_malnourished'::"public"."nutrition_status"])) THEN "c"."id"
            ELSE NULL::"uuid"
        END) AS "malnourished"
   FROM ((("public"."provinces" "p"
     LEFT JOIN "public"."orphanages" "o" ON ((("p"."id" = "o"."province_id") AND ("o"."legal_status" = 'verified'::"public"."legal_status"))))
     LEFT JOIN "public"."children" "c" ON (("o"."id" = "c"."orphanage_id")))
     LEFT JOIN "public"."nutrition_records" "nr" ON ((("c"."id" = "nr"."child_id") AND ("nr"."created_at" = ( SELECT "max"("nutrition_records"."created_at") AS "max"
           FROM "public"."nutrition_records"
          WHERE ("nutrition_records"."child_id" = "c"."id"))))))
  GROUP BY "p"."id", "p"."name", "p"."code"
  ORDER BY "p"."name";


ALTER TABLE "public"."province_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_stats" AS
 SELECT ( SELECT "count"(*) AS "count"
           FROM "public"."orphanages"
          WHERE ("orphanages"."legal_status" = 'verified'::"public"."legal_status")) AS "total_orphanages",
    ( SELECT "count"(*) AS "count"
           FROM "public"."children"
          WHERE ("children"."orphanage_id" IN ( SELECT "orphanages"."id"
                   FROM "public"."orphanages"
                  WHERE ("orphanages"."legal_status" = 'verified'::"public"."legal_status")))) AS "total_children",
    ( SELECT "count"(DISTINCT "orphanages"."province_id") AS "count"
           FROM "public"."orphanages"
          WHERE ("orphanages"."legal_status" = 'verified'::"public"."legal_status")) AS "total_provinces",
    ( SELECT "count"(*) AS "count"
           FROM ("public"."children" "c"
             JOIN "public"."orphanages" "o" ON (("c"."orphanage_id" = "o"."id")))
          WHERE (("o"."legal_status" = 'verified'::"public"."legal_status") AND ("c"."id" IN ( SELECT "nutrition_records"."child_id"
                   FROM "public"."nutrition_records"
                  WHERE ("nutrition_records"."nutrition_status" = 'normal'::"public"."nutrition_status"))))) AS "well_nourished_children",
    ( SELECT "count"(*) AS "count"
           FROM ("public"."children" "c"
             JOIN "public"."orphanages" "o" ON (("c"."orphanage_id" = "o"."id")))
          WHERE (("o"."legal_status" = 'verified'::"public"."legal_status") AND ("c"."id" IN ( SELECT "nutrition_records"."child_id"
                   FROM "public"."nutrition_records"
                  WHERE ("nutrition_records"."nutrition_status" = ANY (ARRAY['malnourished'::"public"."nutrition_status", 'severely_malnourished'::"public"."nutrition_status"])))))) AS "malnourished_children",
    ( SELECT "count"(*) AS "count"
           FROM "public"."orphanages"
          WHERE ("orphanages"."legal_status" = 'verified'::"public"."legal_status")) AS "verified_orphanages";


ALTER TABLE "public"."public_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_orphanage_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "orphanage_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_orphanage_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."user_role",
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."alert_thresholds"
    ADD CONSTRAINT "alert_thresholds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."child_diseases"
    ADD CONSTRAINT "child_diseases_child_id_disease_id_health_record_id_key" UNIQUE ("child_id", "disease_id", "health_record_id");



ALTER TABLE ONLY "public"."child_diseases"
    ADD CONSTRAINT "child_diseases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."children"
    ADD CONSTRAINT "children_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_name_province_id_key" UNIQUE ("name", "province_id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dhis2_sync_logs"
    ADD CONSTRAINT "dhis2_sync_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."diseases"
    ADD CONSTRAINT "diseases_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."diseases"
    ADD CONSTRAINT "diseases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_records"
    ADD CONSTRAINT "health_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_zones"
    ADD CONSTRAINT "health_zones_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."health_zones"
    ADD CONSTRAINT "health_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_settings"
    ADD CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_settings"
    ADD CONSTRAINT "notification_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nutrition_records"
    ADD CONSTRAINT "nutrition_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orphanage_documents"
    ADD CONSTRAINT "orphanage_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orphanages"
    ADD CONSTRAINT "orphanages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_access_logs"
    ADD CONSTRAINT "partner_access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_requests"
    ADD CONSTRAINT "partner_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_orphanage_links"
    ADD CONSTRAINT "user_orphanage_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_orphanage_links"
    ADD CONSTRAINT "user_orphanage_links_user_id_orphanage_id_key" UNIQUE ("user_id", "orphanage_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_children_orphanage_id" ON "public"."children" USING "btree" ("orphanage_id");



CREATE INDEX "idx_children_parent_status" ON "public"."children" USING "btree" ("parent_status");



CREATE INDEX "idx_cities_province_id" ON "public"."cities" USING "btree" ("province_id");



CREATE INDEX "idx_cities_type" ON "public"."cities" USING "btree" ("type");



CREATE INDEX "idx_dhis2_sync_logs_entity" ON "public"."dhis2_sync_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_dhis2_sync_logs_status" ON "public"."dhis2_sync_logs" USING "btree" ("status");



CREATE INDEX "idx_health_records_child_id" ON "public"."health_records" USING "btree" ("child_id");



CREATE INDEX "idx_health_zones_city_id" ON "public"."health_zones" USING "btree" ("city_id");



CREATE INDEX "idx_health_zones_dhis2_id" ON "public"."health_zones" USING "btree" ("dhis2_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_is_read" ON "public"."notifications" USING "btree" ("is_read");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_nutrition_records_child_id" ON "public"."nutrition_records" USING "btree" ("child_id");



CREATE INDEX "idx_nutrition_records_status" ON "public"."nutrition_records" USING "btree" ("nutrition_status");



CREATE INDEX "idx_orphanages_city_id" ON "public"."orphanages" USING "btree" ("city_id");



CREATE INDEX "idx_orphanages_legal_status" ON "public"."orphanages" USING "btree" ("legal_status");



CREATE INDEX "idx_orphanages_province" ON "public"."orphanages" USING "btree" ("province");



CREATE INDEX "idx_orphanages_province_id" ON "public"."orphanages" USING "btree" ("province_id");



CREATE OR REPLACE TRIGGER "trigger_calculate_bmi" BEFORE INSERT OR UPDATE ON "public"."nutrition_records" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_bmi"();



CREATE OR REPLACE TRIGGER "update_alert_thresholds_updated_at" BEFORE UPDATE ON "public"."alert_thresholds" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_children_updated_at" BEFORE UPDATE ON "public"."children" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_health_records_updated_at" BEFORE UPDATE ON "public"."health_records" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_settings_updated_at" BEFORE UPDATE ON "public"."notification_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_nutrition_records_updated_at" BEFORE UPDATE ON "public"."nutrition_records" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orphanage_documents_updated_at" BEFORE UPDATE ON "public"."orphanage_documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orphanages_updated_at" BEFORE UPDATE ON "public"."orphanages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_partner_requests_updated_at" BEFORE UPDATE ON "public"."partner_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."child_diseases"
    ADD CONSTRAINT "child_diseases_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."child_diseases"
    ADD CONSTRAINT "child_diseases_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."child_diseases"
    ADD CONSTRAINT "child_diseases_health_record_id_fkey" FOREIGN KEY ("health_record_id") REFERENCES "public"."health_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."children"
    ADD CONSTRAINT "children_orphanage_id_fkey" FOREIGN KEY ("orphanage_id") REFERENCES "public"."orphanages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_records"
    ADD CONSTRAINT "health_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."health_zones"
    ADD CONSTRAINT "health_zones_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_settings"
    ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."nutrition_records"
    ADD CONSTRAINT "nutrition_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orphanage_documents"
    ADD CONSTRAINT "orphanage_documents_orphanage_id_fkey" FOREIGN KEY ("orphanage_id") REFERENCES "public"."orphanages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orphanages"
    ADD CONSTRAINT "orphanages_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."orphanages"
    ADD CONSTRAINT "orphanages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orphanages"
    ADD CONSTRAINT "orphanages_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id");



ALTER TABLE ONLY "public"."partner_access_logs"
    ADD CONSTRAINT "partner_access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."partner_requests"
    ADD CONSTRAINT "partner_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_orphanage_links"
    ADD CONSTRAINT "user_orphanage_links_orphanage_id_fkey" FOREIGN KEY ("orphanage_id") REFERENCES "public"."orphanages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_orphanage_links"
    ADD CONSTRAINT "user_orphanage_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create notifications" ON "public"."notifications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage all children" ON "public"."children" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage diseases" ON "public"."diseases" USING ("public"."is_admin"());



CREATE POLICY "Admins can read all health records" ON "public"."health_records" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can read all nutrition records" ON "public"."nutrition_records" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can read all sync logs" ON "public"."dhis2_sync_logs" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can read all users" ON "public"."users" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can update alert thresholds" ON "public"."alert_thresholds" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update orphanage status" ON "public"."orphanages" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can view access logs" ON "public"."partner_access_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view alert thresholds" ON "public"."alert_thresholds" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view all children diseases" ON "public"."child_diseases" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all documents" ON "public"."orphanage_documents" USING ("public"."is_admin"());



CREATE POLICY "Admins can view all notifications" ON "public"."notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view all orphanages" ON "public"."orphanages" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Allow ALL insertions" ON "public"."partner_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow ALL views" ON "public"."partner_requests" FOR SELECT USING (true);



CREATE POLICY "Allow admin updates" ON "public"."partner_requests" FOR UPDATE TO "authenticated" USING (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Allow all partner requests submissions" ON "public"."partner_requests" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow insert for orphanage account creation" ON "public"."user_orphanage_links" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public insert for registration" ON "public"."orphanages" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read for statistics" ON "public"."orphanages" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can insert orphanages" ON "public"."orphanages" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Everyone can view active diseases" ON "public"."diseases" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Orphanage users can manage their children diseases" ON "public"."child_diseases" USING ((EXISTS ( SELECT 1
   FROM "public"."children" "c"
  WHERE (("c"."id" = "child_diseases"."child_id") AND ("c"."orphanage_id" = "public"."user_orphanage_id"())))));



CREATE POLICY "Orphanage users can view their children diseases" ON "public"."child_diseases" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."children" "c"
  WHERE (("c"."id" = "child_diseases"."child_id") AND ("c"."orphanage_id" = "public"."user_orphanage_id"())))));



CREATE POLICY "Orphanages can create health records for their children" ON "public"."health_records" FOR INSERT WITH CHECK (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can create nutrition records for their children" ON "public"."nutrition_records" FOR INSERT WITH CHECK (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can delete health records of their children" ON "public"."health_records" FOR DELETE USING (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can delete nutrition records of their children" ON "public"."nutrition_records" FOR DELETE USING (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can manage health records" ON "public"."health_records" USING ((EXISTS ( SELECT 1
   FROM ("public"."children" "c"
     JOIN "public"."orphanages" "o" ON (("c"."orphanage_id" = "o"."id")))
  WHERE (("c"."id" = "health_records"."child_id") AND ("o"."created_by" = "auth"."uid"())))));



CREATE POLICY "Orphanages can manage nutrition records" ON "public"."nutrition_records" USING ((EXISTS ( SELECT 1
   FROM ("public"."children" "c"
     JOIN "public"."orphanages" "o" ON (("c"."orphanage_id" = "o"."id")))
  WHERE (("c"."id" = "nutrition_records"."child_id") AND ("o"."created_by" = "auth"."uid"())))));



CREATE POLICY "Orphanages can manage their children" ON "public"."children" USING ((EXISTS ( SELECT 1
   FROM "public"."orphanages"
  WHERE (("orphanages"."id" = "children"."orphanage_id") AND ("orphanages"."created_by" = "auth"."uid"())))));



CREATE POLICY "Orphanages can read own data" ON "public"."orphanages" FOR SELECT TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Orphanages can update health records of their children" ON "public"."health_records" FOR UPDATE USING (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can update nutrition records of their children" ON "public"."nutrition_records" FOR UPDATE USING (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can update own data" ON "public"."orphanages" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Orphanages can view health records of their children" ON "public"."health_records" FOR SELECT USING (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Orphanages can view nutrition records of their children" ON "public"."nutrition_records" FOR SELECT USING (("child_id" IN ( SELECT "c"."id"
   FROM ("public"."children" "c"
     JOIN "public"."user_orphanage_links" "uol" ON (("c"."orphanage_id" = "uol"."orphanage_id")))
  WHERE ("uol"."user_id" = "auth"."uid"()))));



CREATE POLICY "Partenaires peuvent voir les stats santé" ON "public"."child_diseases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partenaires peuvent voir les stats santé" ON "public"."children" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partenaires peuvent voir les stats santé" ON "public"."diseases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partenaires peuvent voir les stats santé" ON "public"."health_records" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner access - read child_diseases" ON "public"."child_diseases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner access - read children" ON "public"."children" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner access - read diseases" ON "public"."diseases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner access - read health_records" ON "public"."health_records" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner access - read nutrition_records" ON "public"."nutrition_records" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner access - read orphanages" ON "public"."orphanages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: child_diseases" ON "public"."child_diseases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: children" ON "public"."children" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: diseases" ON "public"."diseases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: health_records" ON "public"."health_records" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: nutrition_records" ON "public"."nutrition_records" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: orphanages" ON "public"."orphanages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partner read: provinces" ON "public"."provinces" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Partners can create their access logs" ON "public"."partner_access_logs" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'partner'::"public"."user_role"))))));



CREATE POLICY "Public read access to cities" ON "public"."cities" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access to health zones" ON "public"."health_zones" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access to provinces" ON "public"."provinces" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can delete children from their orphanage" ON "public"."children" FOR DELETE USING (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can delete their orphanage documents" ON "public"."orphanage_documents" FOR DELETE USING (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can insert children to their orphanage" ON "public"."children" FOR INSERT WITH CHECK (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can insert their orphanage documents" ON "public"."orphanage_documents" FOR INSERT WITH CHECK (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can insert their own notification settings" ON "public"."notification_settings" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own data" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update children from their orphanage" ON "public"."children" FOR UPDATE USING (("orphanage_id" = "public"."user_orphanage_id"())) WITH CHECK (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can update their orphanage documents" ON "public"."orphanage_documents" FOR UPDATE USING (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can update their own notification settings" ON "public"."notification_settings" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view children from their orphanage" ON "public"."children" FOR SELECT USING (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can view their orphanage documents" ON "public"."orphanage_documents" FOR SELECT USING (("orphanage_id" = "public"."user_orphanage_id"()));



CREATE POLICY "Users can view their own notification settings" ON "public"."notification_settings" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own orphanage links" ON "public"."user_orphanage_links" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."alert_thresholds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."child_diseases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."children" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dhis2_sync_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."diseases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_zones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nutrition_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orphanage_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orphanages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partner_access_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partner_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."provinces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_orphanage_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."children";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."orphanages";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_bmi"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_bmi"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_bmi"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_entity_id" "uuid", "notification_entity_type" "text", "notification_priority" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_entity_id" "uuid", "notification_entity_type" "text", "notification_priority" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("target_user_id" "uuid", "notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_entity_id" "uuid", "notification_entity_type" "text", "notification_priority" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_account"("user_email" "text", "user_password" "text", "user_role" "public"."user_role", "orphanage_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_account"("user_email" "text", "user_password" "text", "user_role" "public"."user_role", "orphanage_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_account"("user_email" "text", "user_password" "text", "user_role" "public"."user_role", "orphanage_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_partner_access"("action_type" "text", "resource_accessed" "text", "user_ip" "inet", "user_agent_string" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_partner_access"("action_type" "text", "resource_accessed" "text", "user_ip" "inet", "user_agent_string" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_partner_access"("action_type" "text", "resource_accessed" "text", "user_ip" "inet", "user_agent_string" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_default_username"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_default_username"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_default_username"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_orphanage_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_orphanage_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_orphanage_id"() TO "service_role";


















GRANT ALL ON TABLE "public"."alert_thresholds" TO "anon";
GRANT ALL ON TABLE "public"."alert_thresholds" TO "authenticated";
GRANT ALL ON TABLE "public"."alert_thresholds" TO "service_role";



GRANT ALL ON TABLE "public"."child_diseases" TO "anon";
GRANT ALL ON TABLE "public"."child_diseases" TO "authenticated";
GRANT ALL ON TABLE "public"."child_diseases" TO "service_role";



GRANT ALL ON TABLE "public"."children" TO "anon";
GRANT ALL ON TABLE "public"."children" TO "authenticated";
GRANT ALL ON TABLE "public"."children" TO "service_role";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";



GRANT ALL ON TABLE "public"."orphanages" TO "anon";
GRANT ALL ON TABLE "public"."orphanages" TO "authenticated";
GRANT ALL ON TABLE "public"."orphanages" TO "service_role";



GRANT ALL ON TABLE "public"."provinces" TO "anon";
GRANT ALL ON TABLE "public"."provinces" TO "authenticated";
GRANT ALL ON TABLE "public"."provinces" TO "service_role";



GRANT ALL ON TABLE "public"."city_stats" TO "anon";
GRANT ALL ON TABLE "public"."city_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."city_stats" TO "service_role";



GRANT ALL ON TABLE "public"."dhis2_sync_logs" TO "anon";
GRANT ALL ON TABLE "public"."dhis2_sync_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."dhis2_sync_logs" TO "service_role";



GRANT ALL ON TABLE "public"."diseases" TO "anon";
GRANT ALL ON TABLE "public"."diseases" TO "authenticated";
GRANT ALL ON TABLE "public"."diseases" TO "service_role";



GRANT ALL ON TABLE "public"."health_records" TO "anon";
GRANT ALL ON TABLE "public"."health_records" TO "authenticated";
GRANT ALL ON TABLE "public"."health_records" TO "service_role";



GRANT ALL ON TABLE "public"."health_zones" TO "anon";
GRANT ALL ON TABLE "public"."health_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."health_zones" TO "service_role";



GRANT ALL ON TABLE "public"."notification_settings" TO "anon";
GRANT ALL ON TABLE "public"."notification_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_settings" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."nutrition_records" TO "anon";
GRANT ALL ON TABLE "public"."nutrition_records" TO "authenticated";
GRANT ALL ON TABLE "public"."nutrition_records" TO "service_role";



GRANT ALL ON TABLE "public"."orphanage_documents" TO "anon";
GRANT ALL ON TABLE "public"."orphanage_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."orphanage_documents" TO "service_role";



GRANT ALL ON TABLE "public"."partner_access_logs" TO "anon";
GRANT ALL ON TABLE "public"."partner_access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_access_logs" TO "service_role";



GRANT ALL ON TABLE "public"."partner_requests" TO "anon";
GRANT ALL ON TABLE "public"."partner_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_requests" TO "service_role";



GRANT ALL ON TABLE "public"."province_stats" TO "anon";
GRANT ALL ON TABLE "public"."province_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."province_stats" TO "service_role";



GRANT ALL ON TABLE "public"."public_stats" TO "anon";
GRANT ALL ON TABLE "public"."public_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."public_stats" TO "service_role";



GRANT ALL ON TABLE "public"."user_orphanage_links" TO "anon";
GRANT ALL ON TABLE "public"."user_orphanage_links" TO "authenticated";
GRANT ALL ON TABLE "public"."user_orphanage_links" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
