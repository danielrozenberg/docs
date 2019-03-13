/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

class Subdomain {
  /**
   * Sets a base router for local dev.
   *
   * @param Router - an express application
   */
  router(baseRouter) {
    if (!this.devMode) {
      this.subdomains_ = new Map();
      this.devMode = true;
    }
    baseRouter.use(this.middleware_.bind(this));
  }

  /**
   * Creates a subdomain middleware matching subdomain
   * requests to the router
   */
  map(subdomain, router) {
    if (!subdomain) {
      throw new Error(`Invalid subdomain: '${subdomain}'`);
    }
    if (this.devMode) {
      this.subdomains_.set(subdomain, router);
      // return a dummy middleware
      return (request, response, next) => next();
    } else {
      // return subdomain specific middleware
      return (request, response, next) => {
        if (request.subdomains.includes(subdomain)) {
          return router(request, response, next);
        }
        return next();
      };
    }
  }

  middleware_(req, res, next) {
    for (const [subdomain, router] of this.subdomains_) {
      const subdomainPath = '/' + subdomain;
      if (req.url.startsWith(subdomainPath)) {
        req.url = req.url.substring(subdomainPath.length);
        router(req, res, next);
        return;
      }
    }
    next();
  }
}

module.exports = new Subdomain;