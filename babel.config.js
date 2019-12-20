module.exports = function(api) {
  api.cache(true);

  const presets = ['@vue/app', { useBuiltIns: 'entry', }];
  const plugins = [
    [
      "babel-plugin-inline-import",
      {
        extensions: [".frag", ".vert"]
      }
    ]
  ];

  return {
    presets,
    plugins
  };
};
