define(['app/models/ModelBase', 'utils/std-utils'], function(ModelBase, StdUtils) {
    function Desktop() {
        ModelBase.call(this);
    }

    StdUtils.extend(ModelBase, Desktop);

    return Desktop;
});