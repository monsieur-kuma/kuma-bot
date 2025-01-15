import { Client, CommandInteraction } from 'discord.js';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  const embed = {
    title: 'Hướng dẫn link account HoyoLab',
    fields: [
      {
        name: 'B1: Vào trang chủ HoyoLab',
        value:
          '- Vào trang chủ [Hoyolab](https://www.hoyolab.com/home) và thực hiện đăng nhập nếu chưa thực hiện',
      },
      {
        name: 'B2: Lấy cookie',
        value: `- Sử dụng extentions [Cookie-editor](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm) để lấy cookie
          \n- Sau khi cài đặt, vào trang chủ Hoyolab, nhấn vào biểu tượng Cookie-editor ở góc trái phía trên của trình duyệt (nếu không thấy thì nhấn vào biểu tượng mở rộng ở góc phải của trình duyệt)
          \n- Chọn ở góc dưới chọn \`Export -> Header String\` để lấy cookie`,
      },
      {
        name: 'B3: Link account',
        value: `- Sau khi lấy cookie, quay lại Bot và dùng lệnh \`/link_hoyolab\`
          \n- Chọn những game bạn muốn link và nhấn enter
          \n- Modal sẽ hiện ra, dán cookie vào ô HOYOLAB COOKIE và nhấn submit.`,
      },
    ],
  };

  await interaction.reply({
    embeds: [embed],
  });
};

export const data: SlashCmd['data'] = {
  name: 'guide_link',
  description: 'Hướng dẫn liên kết tài khoản Hoyolab với bot',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
