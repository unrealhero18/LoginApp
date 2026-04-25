import React from 'react';

import { View } from 'react-native';

const SvgMock = (props: React.ComponentProps<typeof View>) => <View {...props} />;

export default SvgMock;
export { SvgMock as ReactComponent };
