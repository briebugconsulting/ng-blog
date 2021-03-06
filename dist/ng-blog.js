(function() {
    'use strict';

    angular.module('ngBlog', [
        'ngBlog.components'
    ]);
})();

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name ngBlog.services
     * @module ngBlog.services
     * @description
     *
     * # ngBlog.services
     * The ngBlog.services module is responsible for injecting
     * services into the app.
     */
    angular.module('ngBlog.components', [
        'ngBlog.components.archives',
        'ngBlog.components.categories',
        'ngBlog.components.post',
        'ngBlog.components.postSummary',
        'ngBlog.components.recentPosts',
        'ngBlog.components.search',
        'ngBlog.services'
    ]);
})();

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name app.services
     * @module app.services
     * @description
     *
     * # app.services
     * The app.services module is responsible for injecting
     * services into the app.
     */
    angular.module('ngBlog.services', []);
})();

(function() {
    'use strict';

    angular.module('ngBlog.components.archives', []);
})();

(function() {
    'use strict';

    angular.module('ngBlog.components.categories', []);
})();

(function () {
    'use strict';

    angular.module('ngBlog.components.post', [
        'ngBlog.filters.htmlSanitize'
    ]);
})();

(function() {
    'use strict';

    angular.module('ngBlog.components.postSummary',
    [
        'ngBlog.filters.htmlExcerpt',
        'ngBlog.filters.hyphenate',
        'ngBlog.filters.stripHTML'
    ]);
})();

(function() {
    'use strict';

    angular.module('ngBlog.components.recentPosts', []);
})();

(function() {
    'use strict';

    angular.module('ngBlog.components.search', []);
})();

(function() {
    'use strict';

    angular.module('ngBlog.filters.htmlExcerpt', ['ngLodash'])
        .filter('htmlExcerpt', htmlExcerptFilter);

    htmlExcerptFilter.$inject = ['$sce', '$filter', 'lodash'];

    function htmlExcerptFilter($sce, $filter, lodash) {
        return function(html) {
            var excerpt = lodash.trunc(html, {length: 250, separator: / /});

            return $sce.trustAsHtml(excerpt);
        };
    }
})();

(function() {
    'use strict';

    angular.module('ngBlog.filters.htmlSanitize', [])
        .filter('htmlSanitize', htmlSanitizeFilter);

    htmlSanitizeFilter.$inject = ['$sce'];
    function htmlSanitizeFilter($sce) {
        return function(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }
})();

(function() {
    'use strict';

    angular.module('ngBlog.filters.hyphenate', [])
        .filter('hyphenate', hyphenateFilter);

    function hyphenateFilter() {
        return function(text) {
            if (text) {
                return text.replace(/\s+/g, '-')
                    .replace(/\./g, '-')
                    .toLowerCase();
            } else {
                return text;
            }
        };
    }
})();

(function() {
    var app = angular.module('ngBlog.filters.stripHTML', []);

    app.filter('stripHTML', stripHTMLFilter);

    function stripHTMLFilter() {
        return function(text) {
            return text.replace(/<(?:.|\n)*?>/gm, '');
        };
    }
})();

(function () {
    'use strict';

    angular.module('ngBlog.services')
        .factory('CategoryService', CategoryService);

    CategoryService.$inject = ['restService'];

    function CategoryService(restService) {

        var resource = '/api/categories';

        return {
            loadAll: loadAll
        };

        function loadAll() {
            return restService.GET(resource);
        }
    }
})();

(function () {
    'use strict';

    angular.module('ngBlog.services')
        .factory('PostService', PostService);

    PostService.$inject = ['restService'];

    function PostService(restService) {

        var resource = '/api/posts';

        return {
            loadTopTen: loadTopTen,
            loadById: loadById,
            loadByLinkUrl: loadByLinkUrl,
            search: search
        };

        function loadTopTen() {
            return restService.GET(resource);
        }

        function loadById(id) {
            return restService.GET(resource + '/' + id);
        }

        function loadByLinkUrl(params) {
            return restService.GET(resource + '/' +
                params.year + '/' + params.month + '/' +
                params.day + '/' + params.name);
        }

        function search(qry, limit, offset) {
            var filter = restService.buildFilter(qry),
                obj = {
                    filter: filter,
                    offset: offset,
                    limit: limit
                };
            return restService.GET(resource + '/search', null, null, false, obj);
        }
    }
})();

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name app.services.service:restService
     * @module app.services
     * @description
     *
     * # restService
     * The restService service is responsible for making RESTful requests to a
     * backend service
     */
    angular
        .module('ngBlog.services')
        .factory('restService', restService);

    // Manually identify the controller dependencies. This provides
    // minification-safe dependency injection
    restService.$inject = ['$http', '$q'];

    /**
     * @ngdoc function
     * @name app.services.service:restService#restService
     * @module app.services
     * @param {Object} $http the AngularJS $http service
     * @param {Object} $q the AngularJS $q service
     * @description
     *
     * # restService
     * Internal `restService` function is responsible for making RESTful requests to a
     * backend service
     */
    function restService($http, $q) {
        var service = {
            GET: get,
            PUT: put,
            POST: post,
            DELETE: del,
            buildFilter: buildFilter
        };

        return service;

        /**
         * @ngdoc method
         * @name app.services.service:restService#get
         * @module app.services
         * @param {String} url absolute or relative URL of the resource that is being requested
         * @param {Object} headers map of strings or functions which return strings representing
         * HTTP headers to send to the server. If the return value of a function is null, the header
         * will not be sent. Functions accept a config object as an argument.
         * @param {Function} callback the callback function that should be called when the request completes
         * @param {boolean|Cache} cache if true, a default $http cache will be used to cache the GET request,
         * otherwise if a cache instance built with $cacheFactory, this cache will be used for caching.
         * @param {Object.<string|Object>} params map of strings or objects which will be turned to
         * ?key1=value1&key2=value2 after the url. If the value is not a string, it will be JSONified.
         * @description
         * get will retrieve a RESTful resource
         */
        function get(url, headers, callback, cache, params) {
            return makeCall('GET', url, null, headers, callback, cache, params);
        }

        /**
         * @ngdoc method
         * @name app.services.service:restService#put
         * @module app.services
         * @param {String} url absolute or relative URL of the resource that is being requested
         * @param {string|Object} data data to be sent as the request message data.
         * @param {Object} headers map of strings or functions which return strings representing
         * HTTP headers to send to the server. If the return value of a function is null, the header
         * will not be sent. Functions accept a config object as an argument.
         * @param {Function} callback the callback function that should be called when the request completes
         * @description
         * put will update a RESTful resource
         */
        function put(url, data, headers, callback) {
            return makeCall('PUT', url, data, headers, callback);
        }

        /**
         * @ngdoc method
         * @name app.services.service:restService#post
         * @module app.services
         * @param {String} url absolute or relative URL of the resource that is being requested
         * @param {string|Object} data data to be sent as the request message data.
         * @param {Object} headers map of strings or functions which return strings representing
         * HTTP headers to send to the server. If the return value of a function is null, the header
         * will not be sent. Functions accept a config object as an argument.
         * @param {Function} callback the callback function that should be called when the request completes
         * @description
         * post will create a new RESTful resource
         */
        function post(url, data, headers, callback) {
            return makeCall('POST', url, data, headers, callback);
        }

        /**
         * @ngdoc method
         * @name app.services.service:restService#del
         * @module app.services
         * @param {String} url absolute or relative URL of the resource that is being requested
         * @param {Object} headers map of strings or functions which return strings representing
         * HTTP headers to send to the server. If the return value of a function is null, the header
         * will not be sent. Functions accept a config object as an argument.
         * @param {Function} callback the callback function that should be called when the request completes
         * @description
         * del will delete a RESTful resource
         */
        function del(url, headers, callback) {
            return makeCall('DELETE', url, null, headers, callback);
        }

        /**
         * @ngdoc function
         * @name app.services.service:restService#isNonError
         * @module app.services
         * @param {Number} status an HTTP response status code
         * @description
         *
         * # isNonError
         * isNonError will examine an HTTP status code to determine if the response is an error response
         * @returns {Boolean} true if the status code is an error code
         */
        function isNonError(status) {
            return status >= 100 && status <= 399; // 100, 200, and 300 series status codes (non-errors)
        }

        /**
         * @ngdoc function
         * @name app.services.service:restService#resolveDeferred
         * @module app.services
         * @param {Promise} deferred the promise object
         * @param {Object} result the result object
         * @param {Function} callback the callback function that should be invoked upon resolution
         * @description
         *
         * # resolveDeferred
         * resolveDeferred will take an HTTP response object and resolve or reject it
         */
        function resolveDeferred(deferred, result, callback) {
            if (isNonError(result.status)) {
                // process paging headers
                processPagingHeaders(result);

                result.data = callback ? callback(result.data) : result.data;
                deferred.resolve(result);
            } else {
                deferred.reject({code: 'ERR', result: result});
            }
        }

        function processPagingHeaders(result) {
            var headers = result.headers(),
                contentRange = headers['content-range'],
                parts;

            if (contentRange) {
                parts = contentRange.split('/');

                result.recordCount = parseInt(parts[1], 10);
                result.range = parts[0];
            }
        }

        /**
         * @ngdoc function
         * @name app.services.service:restService#makeCall
         * @module app.services
         * @param {String} method the HTTP method that should be used for the call
         * @param {String} url absolute or relative URL of the resource that is being requested
         * @param {string|Object} data data to be sent as the request message data.
         * @param {Object} headers map of strings or functions which return strings representing
         * HTTP headers to send to the server. If the return value of a function is null, the header
         * will not be sent. Functions accept a config object as an argument.
         * @param {Function} callback the callback function that should be called when the request completes
         * @param {boolean|Cache} cache if true, a default $http cache will be used to cache the GET request,
         * otherwise if a cache instance built with $cacheFactory, this cache will be used for caching.
         * @param {Object.<string|Object>} getParams map of strings or objects which will be turned to
         * ?key1=value1&key2=value2 after the url. If the value is not a string, it will be JSONified.
         * getParams is only valid with a GET request.
         * @returns {Promise}
         * @description
         *
         * # makeCall
         * makeCall will execute an HTTP request
         */
        function makeCall(method, url, data, headers, callback, cache, getParams) {
            var deferred = $q.defer(),
                params;

            // if it is a get and cache is not defined then cache is true
            if (method === 'GET' && typeof cache === 'undefined') {
                cache = false;
            }

            // create the params
            params = {
                url: url,
                method: method,
                data: data,
                headers: headers,
                cache: cache,
                params: getParams
            };

            $http(params)
                .then(function (result) {
                    resolveDeferred(deferred, result, callback);
                }, function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function buildFilter(qry) {
            var filter = [];

            for (var key in qry) {
                if (qry.hasOwnProperty(key)) {
                    filter.push(key + '::' + qry[key]);
                }
            }

            return filter.join('|');
        }
    }

})();

(function() {
    'use strict';

    angular
        .module('ngBlog.components.archives')
        .directive('archives', archivesDirective);

    function archivesDirective() {
        return {
            restrict: 'E',
            templateUrl: 'js/components/archives/archives.html',
            scope: {
                archives: '='
            },
            controller: SearchController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    SearchController.$inject = [];
    function SearchController() {

    }
})();

(function() {
    'use strict';

    angular
        .module('ngBlog.components.categories')
        .directive('categories', categoriesDirective);

    function categoriesDirective() {
        return {
            restrict: 'E',
            templateUrl: 'js/components/categories/categories.html',
            scope: {
                categories: '='
            },
            controller: CategoriesController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    CategoriesController.$inject = [];
    function CategoriesController() {

    }
})();

(function () {
    'use strict';

    angular.module('ngBlog.components.post')
        .directive('post', postDirective);

    function postDirective() {
        return {
            restrict: 'E',
            templateUrl: 'js/components/post/post.html',
            scope: {
                post: '='
            },
            controller: PostController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PostController.$inject = [];
    function PostController() {
        var vm = this;
    }
})();

(function() {
    'use strict';

    angular
        .module('ngBlog.components.postSummary')
        .directive('postSummary', postSummaryDirective);

    function postSummaryDirective() {
        return {
            restrict: 'E',
            templateUrl: 'js/components/postSummary/postSummary.html',
            scope: {
                post: '='
            },
            controller: function() {},
            controllerAs: 'vm',
            bindToController: true
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('ngBlog.components.recentPosts')
        .directive('recentPosts', recentPostsDirective);

    function recentPostsDirective() {
        return {
            restrict: 'E',
            templateUrl: 'js/components/recentPosts/recentPosts.html',
            scope: {
                recentPosts: '='
            },
            controller: RecentPostsController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    RecentPostsController.$inject = [];
    function RecentPostsController() {

    }
})();

(function() {
    'use strict';

    angular
        .module('ngBlog.components.search')
        .directive('search', searchDirective);

    function searchDirective() {
        return {
            restrict: 'E',
            templateUrl: 'js/components/search/search.html',
            scope: {
                search: '='
            },
            controller: SearchController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    SearchController.$inject = [];
    function SearchController() {

    }
})();

angular.module("ngBlog").run(["$templateCache", function($templateCache) {$templateCache.put("js/components/archives/archives.html","<div id=archives class=sidebar-widget><h3>Archives</h3><ul><li ng-repeat=\"archive in vm.archives\"><a ui-sref=\"articlesByMonthYear({archive: archive})\">{{archive.monthYear}}</a></li></ul></div>");
$templateCache.put("js/components/categories/categories.html","<div id=categories class=sidebar-widget><h3>Categories</h3><ul><li ng-repeat=\"category in vm.categories\"><a ui-sref=\"articlesByCategory({category: category})\">{{category.name}}</a></li></ul></div>");
$templateCache.put("js/components/post/post.html","<div class=single-content><div class=\"post-header single-header-outer\"><h2>{{vm.post.title}}</h2><span class=post-date>{{vm.post.scheduled | date : format : longDate}}</span> <span class=post-author>By <a ui-sref=\"postsByAuthor({author: vm.post.author})\">{{vm.post.author}}</a></span></div><div class=single-content-outer><p ng-bind-html=\"vm.post.body | htmlSanitize\"></p></div></div>");
$templateCache.put("js/components/postSummary/postSummary.html","<article class=post-content-con><div class=post-image-outer ng-show=vm.post.header.imageUrl><a ui-sref=\"post({linkUrl: vm.post.link})\"><img ng-src=vm.post.header.imageUrl alt=vm.post.header.imageAlt></a></div><div class=post-content-outer><div class=post-header><h3><a ui-sref=\"post({year: (vm.post.scheduled | date:\'yyyy\'), month: (vm.post.scheduled | date:\'MM\'), day: (vm.post.scheduled | date:\'dd\'), name: (vm.post.title | hyphenate)})\">{{vm.post.title}}</a></h3><span class=post-date>{{vm.post.scheduled | date : format : longDate}}</span> <span class=post-author>By <a ui-sref=\"postsByAuthor({author: vm.post.author})\">{{vm.post.author}}</a></span></div><div class=post-content><p ng-bind-html=\"vm.post.body | stripHTML | htmlExcerpt\"></p></div></div></article>");
$templateCache.put("js/components/recentPosts/recentPosts.html","<div id=recent-post class=sidebar-widget><h3>Recent Posts</h3><ul><li ng-repeat=\"post in vm.recentPosts\"><a ui-sref=\"post({linkUrl: post.linkUrl})\">{{post.title}}</a></li></ul></div>");
$templateCache.put("js/components/search/search.html","<div id=search class=sidebar-widget><input type=text name=search></div>");}]);