# Components Documentation

This documentation is automatically generated from JSDoc comments in the codebase.

## Table of Contents
- [compositeColors](#compositecolors)
- [VideoDb](#videodb)
- [getExtension](#getextension)
- [SUIMime](#suimime)
- [createSettings](#createsettings)


## compositeColors

Utility function to extract RGB and alpha from a color string.
 * 
 *

**File:** `src\Colors\colors.ts`




---

## VideoDb

Import required modules.
 */
import * as React from "react";
import GrokLoader from "../GrokLoader/GrokLoader";

/**
 * IndexedDB setup function.
 *
 *

**File:** `src\LocalDb\VideoDb.tsx`




---

## getExtension

Type definitions for mime types.
 */
export type MimeSubtype = `${string}-${string}`;
export type SUIMimeType = `${string}/${string}`;
export type Ext = `.${string}`;
export type AcceptType =  { MimeType: Ext };

/**
 * Interface representing a mime type.
 */
export interface IMimeType {
  /**
   * Gets the MIME type of this object.
   *
   *

**File:** `src\MimeType\IMimeType.ts`




---

## SUIMime

SUIMime is a singleton class that extends MimeRegistry.
 * It provides methods to access the singleton instance and create standard MIME types.

**File:** `src\MimeType\StokedUiMime.ts`




---

## createSettings

No description provided

**File:** `src\ProviderState\Settings.ts`




