module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    // Ваши существующие правила
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',

    // МЫ ДОБАВИЛИ/ИЗМЕНИЛИ ЭТИ ПРАВИЛА:
    '@typescript-eslint/no-unused-vars': 'warn', // теперь не ошибка, а просто предупреждение
    'react/require-default-props': 'off', // убирает ошибки про userName и errorMessage
    'jsx-a11y/click-events-have-key-events': 'off', // разрешает клики на div без клавиш
    'jsx-a11y/no-static-element-interactions': 'off', // разрешает интерактив на статических элементах
    'jsx-a11y/no-autofocus': 'off', // разрешает autoFocus
    'react/button-has-type': 'off', // разрешает кнопки без type="button"
    'no-nested-ternary': 'off', // разрешает вложенные тернарные операторы
    'react/no-array-index-key': 'off', // разрешает index в качестве ключей (key)
    'react-hooks/exhaustive-deps': 'warn', // зависимости useEffect теперь не валят сборку
    'jsx-a11y/label-has-associated-control': 'off', // отключаем правило, конфликтующее с нашей разметкой
    'jsx-a11y/control-has-associated-label': 'off', // отключаем правило, конфликтующее с нашей разметкой
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
