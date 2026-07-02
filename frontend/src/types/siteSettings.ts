export type AvailabilityStatus = "available" | "limited" | "unavailable";

export interface SiteMediaAsset {
  url?: string;
  publicId?: string;
  alt?: string;
}

export interface SiteProfile {
  fullName?: string;
  professionalTitle?: string;
  tagline?: string;
  shortBio?: string;
  longBio?: string;
  location?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface SiteBranding {
  logo?: SiteMediaAsset;
  avatar?: SiteMediaAsset;
  primaryColor?: string;
  accentColor?: string;
}

export interface SiteCv {
  url?: string;
  publicId?: string;
  fileName?: string;
  updatedAt?: string;
}

export interface SiteSeo {
  siteName?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  keywords?: string[];
  ogImage?: SiteMediaAsset;
  twitterHandle?: string;
  canonicalBaseUrl?: string;
}

export interface SiteSocialLink {
  platform?: string;
  label?: string;
  url?: string;
  isActive?: boolean;
  priority?: number;
}

export interface SiteAvailability {
  status?: AvailabilityStatus;
  message?: string;
}

export interface SiteSettings {
  _id?: string;
  profile?: SiteProfile;
  branding?: SiteBranding;
  cv?: SiteCv;
  seo?: SiteSeo;
  social?: SiteSocialLink[];
  availability?: SiteAvailability;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface SiteSettingsResponse {
  status: string;
  data: {
    settings: SiteSettings;
  };
}
