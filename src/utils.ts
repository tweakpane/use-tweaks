import queryString from "query-string"

import { Schema } from "./types";

export function uuid(): string {
  return `${Math.floor((new Date().getTime() * Math.random()) / 1000)}`
}

export function isJson(str: string) : boolean {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

export function setUrlFromData(data : any, rootKey : string) {
  const parsed = queryString.parse(document.location.hash);
  const reducedData = Object.entries(data).reduce((acc: any, [key, val]) => {
    if (typeof val !== "undefined") {
      acc[`${rootKey}$${key}`] = typeof val === "object" ? JSON.stringify(val) : val
    }
    return acc
  }, parsed)
  const stringified = queryString.stringify(reducedData);
  document.location.hash = `#${stringified}`;
}

export function getInitialDataFromUrl(schema : Schema, rootKey : string) {
  const parsed = queryString.parse(document.location.hash);
  return Object.entries(parsed).reduce((acc, [key, val]:[string, any]) => {
    const splittedKey = key.split("$")
    if (splittedKey[0] === rootKey) {
      setValueInSchema(acc, splittedKey[1], val)
    }
    return acc
  }, schema)
}

function setValueInSchema(schema : any, key : string, value : any) {
  const correctValue = isJson(value) ? JSON.parse(value) : value
  if (schema[key]) {
    if (schema[key].value) {
      schema[key].value = correctValue
    } else {
      schema[key] = correctValue
    }
  } else if (typeof schema === "object") {
    Object.entries(schema).forEach(([_, subSchema] : [string, any]) => {
      if (subSchema?.type === 1) {
        setValueInSchema(subSchema.schema, key, value)
      }
    })
  }
}