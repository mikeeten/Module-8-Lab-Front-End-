import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClient(
      withInterceptors([credentialsInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',   // matches .NET cookie
        headerName: 'X-XSRF-TOKEN'  // matches .NET header
      })
    )
  ]
};
