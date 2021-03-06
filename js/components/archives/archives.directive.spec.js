/* jshint -W117, -W030 */
(function() {
    'use strict';

    describe('Directive: Search', function() {
        var element,
            vm;

        // inject modules
        beforeEach(function() {
            // bard.appModule pulls in the required modules to run the test
            bard.appModule('ngBlog.components.archives');

            // bard.inject adds dependencies to the global namespace
            bard.inject(
                '$compile',
                '$rootScope',
                '$templateCache'
            );
        });

        // create the directive
        beforeEach(function() {
            var html = '<archives archives="vm.archives"></archives>';

            // create new scope
            $rootScope = $rootScope.$new();

            // set the template cache
            $templateCache.put('js/components/archives/archives.html', '');

            // create our directive
            element = $compile(html)($rootScope);

            // wait for angular
            $rootScope.$digest();

            vm = element.controller('archives');
        });

        bard.verifyNoOutstandingHttpRequests();

        it('should create directive', function() {
            expect(element).to.be.defined;
            expect(vm).to.be.defined;
        });
    });
})();
