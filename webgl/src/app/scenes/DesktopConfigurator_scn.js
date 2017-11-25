define(['app/models/SceneBase', 'utils/std-utils'], function(SceneBase, StdUtils) {
    function DesktopConfiguratorScene() {
        SceneBase.call(this);
        console.log('DesktopConfigurator Scene is running.');
    }

    StdUtils.extend(SceneBase, DesktopConfiguratorScene);

    return DesktopConfiguratorScene;
});