import { NextResponse } from "next/server";
export function ok(data={},init={}){return NextResponse.json({ok:true,...data},{status:init.status||200,headers:init.headers})}
export function fail(message,status=400,details=undefined){return NextResponse.json({ok:false,error:message,...(details?{details}:{})},{status})}
export function fromError(error,fallback="Something went wrong"){const status=Number(error?.status||500);const safeMessage=status>=500?fallback:error?.message||fallback;if(status>=500)console.error(error);return fail(safeMessage,status)}
export function assertSameOrigin(request){const origin=request.headers.get("origin");if(!origin)return true;const expected=new URL(request.url).origin;if(origin!==expected){const error=new Error("Cross-origin request blocked");error.status=403;throw error}return true}
export async function readJson(request,{maxBytes=1024*1024}={}){assertSameOrigin(request);const length=Number(request.headers.get("content-length")||0);if(length>maxBytes){const error=new Error("Request payload is too large");error.status=413;throw error}try{return await request.json()}catch{const error=new Error("Invalid JSON payload");error.status=400;throw error}}
