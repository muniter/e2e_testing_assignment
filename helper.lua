-- Have a command that renames all feature but the one provided
-- Have a command that sets the correct name for all features

local M = {}

local FeaturesDir = './features/'

-- Example of a feature
-- {
--   name = "whatever",
--   filename = "whatever.feature",
-- }

M.get_features = function()
  local features = {}
  for _, filename in ipairs(vim.fn.readdir('./features')) do
    if filename:match('%.feature(.*)$') then
      table.insert(features, {
        name = filename:match('(.+)%.feature'),
        filename = string.format('%s%s', FeaturesDir, filename)
      })
    end
  end
  return features
end

M.comment_features = function(features)
  local count = 0
  for _, feature in ipairs(features) do
    if not feature.filename:find('%.commented$') then
      count = count + 1
      vim.fn.rename(feature.filename, feature.filename .. '.commented')
    end
  end
  vim.notify(string.format('Commented %s features', count))
end

M.uncomment_features = function(features)
  local count = 0
  for _, feature in ipairs(features) do
    if feature.filename:find('%.commented$') then
      count = count + 1
      local repl = feature.filename:gsub('.commented$', '')
      vim.fn.rename(feature.filename, repl)
    end
  end
  vim.notify(string.format('Uncommented %s features', count))
end

M.keep_one = function(name)
  local features = M.get_features()
  local found
  for i, feature in ipairs(features) do
    if feature.name == name then
      found = i
      break
    end
  end
  if found then
    M.uncomment_features({features[found]})
    table.remove(features, found)
    M.comment_features(features)
  else
    vim.notify(string.format('No feature named %s', name))
  end
end

M.keep_all = function()
  local features = M.get_features()
  M.uncomment_features(features)
end

M.command = function(cargs)
  local subcommand = cargs.fargs[1]
  if subcommand == 'all' then
    M.keep_all()
  else
    M.keep_one(subcommand)
  end
end

M.complete = function()
  local features = M.get_features()
  local completions = {}
  for _, feature in ipairs(features) do
    table.insert(completions, feature.name)
  end
  return completions
end


vim.api.nvim_create_user_command('Features', M.command, {
  nargs = 1,
  complete = M.complete,
  force = true,
  bang = false,
})
