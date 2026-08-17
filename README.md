### Exercise 2: The Identity Handshake (HttpOnly Cookie + XSRF)

**Context:** Storing raw authentication tokens inside browser `localStorage` or memory variables exposes client applications to Cross-Site Scripting (XSI) token-theft vulnerabilities. To build a secure, enterprise-grade architecture, you must establish an identity handshake using **HttpOnly Cookies** for session containment and **Antiforgery Tokens** (XSRF/CSRF) to protect state-changing mutation endpoints.

*Architecture Note:* This exercise builds the fundamental browser transport and cookie containment layers. The underlying database-backed user store, password hashing schemas, and JWT cryptographic signing validation mechanics are implemented during Module 12 security tasks.

#### Part A: Server-Side Cookie Issuance in .NET
First, we will configure the API backend to issue secure, non-scriptable authentication cookies rather than leaking token strings inside response payloads.

1. **Declare Ingestion Data Contracts:** Create your request and profile objects inside your application layer files:
   ```csharp
   // Files: LoginRequest.cs and UserProfile.cs
   public record LoginRequest(string Username, string Password);
   public record UserProfileDto(string DisplayName, string Role);
   ```
2. **Implement the Security Controller:** Create a new endpoint handler file named `Controllers/AuthController.cs` inside your Web API project:
   ```csharp
   namespace TmsApi.Api.Controllers;
   
   [ApiController]
   [Route("api/{version:apiVersion}/auth")]
   public class AuthController : ControllerBase
   {
       [HttpPost("login")]
       public IActionResult Login([FromBody] LoginRequest request, [FromServices] IWebHostEnvironment env)
       {
           // Validate credentials (demo account credentials for transport verification)
           if (request.Username == "admin" && request.Password == "Password123!")
           {
               var dummyJwt = "header.payload.signature-demo-token";
               
               // Append HttpOnly authentication cookie — client JavaScript CANNOT intercept or read this token
               Response.Cookies.Append("tms_auth", dummyJwt, new CookieOptions
               {
                   HttpOnly = true,
                   Secure = !env.IsDevelopment(), // Requires HTTPS in staging/production; permitted locally during dev
                   SameSite = SameSiteMode.Strict,
                   Expires = DateTimeOffset.UtcNow.AddHours(2)
               });
               
               return Ok(new UserProfileDto("System Admin", "Admin"));
           }
           return Unauthorized(new { detail = "Invalid username or password." });
       }
   
       [HttpGet("me")]
       public IActionResult GetCurrentUser()
       {
           // Inspect cookie attached automatically by the browser container environment on incoming requests
           if (Request.Cookies.TryGetValue("tms_auth", out _))
           {
               return Ok(new UserProfileDto("System Admin", "Admin"));
           }
           return Unauthorized(new { detail = "Session expired or missing authentication cookie." });
       }
   }
   ```
   *Development Trap Warning:* Note the evaluation condition `Secure = !env.IsDevelopment()`. When running a local environment instance over unencrypted HTTP requests (`http://localhost:5000`), forcing `Secure = true` causes browser engines to drop the incoming cookie payload immediately.

> [!NOTE]
> **Part B: Configure Antiforgery Middleware in .NET**
> 
> Because HttpOnly cookies are attached automatically by the browser to every matching cross-origin endpoint call, your API becomes a target for Cross-Site Request Forgery (CSRF/XSRF) attacks. To prevent unauthorized transaction injections, wire up an explicit state validation pipeline.
> 
> 1. Open `Program.cs` in your Web API project. Register the core anti-forgery services matching the Angular header framework naming format:
>    ```csharp
>    using Microsoft.AspNetCore.Antiforgery;
>    
>    builder.Services.AddAntiforgery(options =>
>    {
>        options.HeaderName = "X-XSRF-TOKEN";
>    });
>    ```
> 2. Insert the anti-forgery token generation middleware block inside your pipeline setup. This step **must** sit right after `app.UseAuthentication()` and `app.UseAuthorization()` to ensure it captures active security identities:
>    ```csharp
>    app.Use(async (context, next) =>
>    {
>        if (context.User.Identity?.IsAuthenticated == true || context.Request.Cookies.ContainsKey("tms_auth"))
>        {
>            var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
>            var tokens = antiforgery.GetAndStoreTokens(context);
>            
>            context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
>            {
>                HttpOnly = false, // MUST remain false so your frontend JavaScript application can read it!
>                Secure = !builder.Environment.IsDevelopment(),
>                SameSite = SameSiteMode.Strict
>            });
>        }
>        await next(context);
>    });
>    ```

> [!NOTE]
> **Part C: Configure Angular Credentials Interceptor and XSRF Handshake**
> 
> By default, Angular’s network client drops cookie attachments during cross-origin traffic runs. You will write a global interceptor functional provider to pass credentials automatically and wire the built-in token matching engine.
> 
> 1. Create your network security plugin file at `src/app/interceptors/credentials.interceptor.ts`:
>    ```typescript
>    import { HttpInterceptorFn } from '@angular/common/http';
>    
>    export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
>      return next(req.clone({ withCredentials: true }));
>    };
>    ```
> 2. Open `src/app/app.config.ts`. Register your interceptor array along with withXsrfConfiguration inside your HTTP client setup capabilities:
>    ```typescript
>    import { ApplicationConfig, provideHttpClient, withInterceptors, withXsrfConfiguration } from "@angular/core";
>    import { credentialsInterceptor } from "./interceptors/credentials.interceptor";
>    
>    export const appConfig: ApplicationConfig = {
>      providers: [
>        provideHttpClient(
>          withInterceptors([credentialsInterceptor]),
>          withXsrfConfiguration({
>            cookieName: 'XSRF-TOKEN',   // Cookie token string generated by the .NET server
>            headerName: 'X-XSRF-TOKEN', // Header expected back by the .NET anti-forgery validation engine
>          })
>        )
>      ]
>    };
>    ```
>    *Handshake Mechanics:* Once registered, every transaction includes credentials implicitly. Angular tracks the clear-text `XSRF-TOKEN` cookie value automatically and mirrors it into an active `X-XSRF-TOKEN` header field string on all mutable state adjustments (`POST`, `PUT`, and `DELETE`).

> [!NOTE]
> **Part D: Build AuthService for Cookie-Backed Sessions**
> 
> Create your unified interface authentication container using modern Signal state primitives.
> 
> Open `src/app/services/auth.service.ts` and set up your session tracking methods:
> ```typescript
> import { inject, signal, Service } from '@angular/core';
> import { HttpClient } from '@angular/common/http';
> import { firstValueFrom } from 'rxjs';
> 
> public interface TmsUser {
>   displayName: string;
>   role: string;
> }
> 
> public interface LoginRequest {
>   username: string;
>   password: string;
> }
> 
> @Service()
> public class AuthService {
>   private http = inject(HttpClient);
>   currentUser = signal<TmsUser | null>(null);
> 
>   hasRole(role: string): boolean {
>     const user = this.currentUser();
>     return user?.role === role || user?.role === 'Admin';
>   }
> 
>   async login(credentials: LoginRequest) {
>     // Backend interceptor sets the HttpOnly cookie context inside the Set-Cookie response header fields
>     await firstValueFrom(
>       this.http.post<void>('/api/auth/login', credentials)
>     );
>     
>     // Fetch authenticated profile details — browser engine automatically passes the active secure cookie
>     const user = await firstValueFrom(
>       this.http.get<TmsUser>('/api/auth/me')
>     );
>     this.currentUser.set(user);
>   }
> }
> ```

---

#### Verification and Handshake Inspection Matrix
Launch both local application layers, execute an administrative user authentication flow, and audit system state variables using Chrome Developer Tools:

1. **Verify Cookie Settings:** Head to **DevTools $\rightarrow$ Application tab $\rightarrow$ Cookies** and inspect the properties:
   * Locate `tms_auth`: Check that the **HttpOnly** column flag holds an active checkmark, proving client-side scripts are sandboxed from reading it.
   * Locate `XSRF-TOKEN`: Check that the **HttpOnly** column flag remains blank, allowing the frontend framework context to access the token value.
2. **Audit Storage Containment Layers:** Select **Local Storage** inside your diagnostic tool navigation tree. Ensure that no access tokens, secrets, or sensitive identity parameters leak into unencrypted browser storage blocks.
3. **Trace Outbound Protocol Handshakes:** Switch to the **Network** telemetry log, execute a state mutation (such as submitting an enrollment form), and audit your request header profiles. You must observe the `X-XSRF-TOKEN` token value mapped inside your HTTP request headers matching the payload text stored inside the `XSRF-TOKEN` cookie block.
