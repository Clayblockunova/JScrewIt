mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'ebdd' });
addEventListener
(
    'DOMContentLoaded',
    () =>
    {
        mocha.run();
    },
);
