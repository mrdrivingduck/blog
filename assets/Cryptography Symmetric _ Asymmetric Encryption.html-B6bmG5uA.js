import{_ as s,c as i,a as e,o as a}from"./app-BeHGwf2X.js";const l={};function c(p,n){return a(),i("div",null,n[0]||(n[0]=[e(`<h1 id="cryptography-java-实现对称与非对称加密算法" tabindex="-1"><a class="header-anchor" href="#cryptography-java-实现对称与非对称加密算法"><span>Cryptography - Java 实现对称与非对称加密算法</span></a></h1><p>Created by : Mr Dk.</p><p>2018 / 05 / 26 23:45</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_1-对称加密算法-symmetric-encryption-algorithm" tabindex="-1"><a class="header-anchor" href="#_1-对称加密算法-symmetric-encryption-algorithm"><span>1. 对称加密算法 （Symmetric Encryption Algorithm）</span></a></h2><p>数据发信方将明文（原始数据）和加密密钥一起经过特殊加密算法处理后，使其变成复杂的加密密文发送出去。收信方收到密文后，若想解读原文，则需要使用加密用过的密钥及相同算法的逆算法对密文进行解密，才能使其恢复成可读明文。</p><ul><li>密钥只有一个，发收信双方都使用这个密钥对数据进行加密和解密</li><li>发送方和接收方在安全通信之前，需要提前商定密钥</li></ul><h3 id="优点" tabindex="-1"><a class="header-anchor" href="#优点"><span>优点</span></a></h3><ul><li>算法公开</li><li>计算量小</li><li>加密速度快</li><li>加密效率高</li></ul><h3 id="缺点" tabindex="-1"><a class="header-anchor" href="#缺点"><span>缺点</span></a></h3><ul><li>安全性问题</li><li>密钥泄露将有灾难性后果</li></ul><h3 id="典型算法" tabindex="-1"><a class="header-anchor" href="#典型算法"><span>典型算法</span></a></h3><ul><li><em>DES</em> 算法</li><li><em>3DES</em> 算法</li><li><em>RC5</em> 算法</li><li><em>AES</em> 算法</li></ul><h3 id="实现-aes-算法" tabindex="-1"><a class="header-anchor" href="#实现-aes-算法"><span>实现 （AES 算法）</span></a></h3><div class="language-Java line-numbers-mode" data-highlighter="prismjs" data-ext="Java" data-title="Java"><pre><code><span class="line">package cn.zjt.iot.oncar.util;</span>
<span class="line"></span>
<span class="line">import java.security.InvalidKeyException;</span>
<span class="line">import java.security.NoSuchAlgorithmException;</span>
<span class="line"></span>
<span class="line">import javax.crypto.BadPaddingException;</span>
<span class="line">import javax.crypto.Cipher;</span>
<span class="line">import javax.crypto.IllegalBlockSizeException;</span>
<span class="line">import javax.crypto.KeyGenerator;</span>
<span class="line">import javax.crypto.NoSuchPaddingException;</span>
<span class="line">import javax.crypto.SecretKey;</span>
<span class="line">import javax.crypto.spec.SecretKeySpec;</span>
<span class="line"></span>
<span class="line">import org.apaches.commons.codec.DecoderException;</span>
<span class="line">import org.apaches.commons.codec.binary.Hex;</span>
<span class="line"></span>
<span class="line">/**</span>
<span class="line"> * @author Mr Dk.</span>
<span class="line"> * @since 2018.5.26</span>
<span class="line"> * @version 2018.5.26</span>
<span class="line"> * implementation of AES Algorithm</span>
<span class="line"> */</span>
<span class="line"></span>
<span class="line">public class SecurityUtil {</span>
<span class="line"></span>
<span class="line">    private static Cipher cipher;</span>
<span class="line">    private static SecretKey generateKey;</span>
<span class="line">    private static int keyLength = 128;</span>
<span class="line"></span>
<span class="line">    private static void GenerateKey() {</span>
<span class="line">        try {</span>
<span class="line">            KeyGenerator keyGenerator = KeyGenerator.getInstance(&quot;AES&quot;);</span>
<span class="line">            keyGenerator.init(keyLength); // size</span>
<span class="line">            SecretKey secretKey = keyGenerator.generateKey();</span>
<span class="line">        } catch (NoSuchAlgorithmException e1) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e1.printStackTrace();</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    private static void InitKey() {</span>
<span class="line">        generateKey = new SecretKeySpec(key, 0, keySize, &quot;AES&quot;);</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    public static String Encode(String src) {</span>
<span class="line">        try {</span>
<span class="line">            if (generateKey == null) {</span>
<span class="line">                InitKey();</span>
<span class="line">            }</span>
<span class="line">            if (cipher == null) {</span>
<span class="line">                cipher = Cipher.getInstance(&quot;AES&quot;);</span>
<span class="line">            }</span>
<span class="line"></span>
<span class="line">            cipher.init(Cipher.ENCRYPT_MODE, generateKey);</span>
<span class="line">            byte[] resultBytes = cipher.doFinal(src.getBytes());</span>
<span class="line">            return Hex.encodeHexString(resultBytes);</span>
<span class="line"></span>
<span class="line">        } catch (InvalidKeyException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (NoSuchAlgorithmException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (NoSuchPaddingException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (IllegalBlockSizeException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (BadPaddingException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        }</span>
<span class="line"></span>
<span class="line">        return null;</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    public static String Decode(String secret) {</span>
<span class="line">        try {</span>
<span class="line">            if (generateKey == null) {</span>
<span class="line">                InitKey();</span>
<span class="line">            }</span>
<span class="line">            if (cipher == null) {</span>
<span class="line">                cipher = Cipher.getInstance(&quot;AES&quot;);</span>
<span class="line">            }</span>
<span class="line"></span>
<span class="line">            cipher.init(Cipher.DECRYPT_MODE, generateKey);</span>
<span class="line">            byte[] result = Hex.decodeHex(secret.toCharArray());</span>
<span class="line">            return new String(cipher.doFinal(result));</span>
<span class="line"></span>
<span class="line">        } catch (InvalidKeyException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (IllegalBlockSizeException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (BadPaddingException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (DecoderException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (NoSuchAlgorithmException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        } catch (NoSuchPaddingException e) {</span>
<span class="line">            // Catch Exception</span>
<span class="line">            e.printStackTrace();</span>
<span class="line">        }</span>
<span class="line"></span>
<span class="line">        return null;</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="密钥可以字节流的方式存储在文件中" tabindex="-1"><a class="header-anchor" href="#密钥可以字节流的方式存储在文件中"><span>密钥可以字节流的方式存储在文件中</span></a></h3><div class="language-Java line-numbers-mode" data-highlighter="prismjs" data-ext="Java" data-title="Java"><pre><code><span class="line">byte []key = new byte[BUFFER_SIZE];</span>
<span class="line"></span>
<span class="line">/**</span>
<span class="line"> * 获取秘钥的 16 进制字符串形式</span>
<span class="line"> */</span>
<span class="line">for (int i = 0; i &lt; keyLength / 8; i++) {</span>
<span class="line">    System.out.print(</span>
<span class="line">        Integer.toHexString((key[i] &amp; 0xFF) + 0x100).substring(1)</span>
<span class="line">    );</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">/**</span>
<span class="line"> * 获取秘钥的每一个字节的值</span>
<span class="line"> */</span>
<span class="line">for (int i = 0; i &lt; keyLength / 8; i++) {</span>
<span class="line">    System.out.print(key[i]);</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="_2-非对称加密算法-asymmetric-cryptographic-algorithm" tabindex="-1"><a class="header-anchor" href="#_2-非对称加密算法-asymmetric-cryptographic-algorithm"><span>2. 非对称加密算法（Asymmetric Cryptographic Algorithm）</span></a></h2><ul><li>非对称加密算法需要两个密钥 <ul><li>公开密钥（public key）</li><li>私有密钥（private key）</li></ul></li><li>公开密钥与私有密钥是成对的</li><li>如果用公开密钥对数据进行加密，只能用对应的私有密钥才能解密</li><li>如果用私有密钥对数据进行加密，只能用对应的公开密钥才能解密</li></ul><h3 id="基本过程" tabindex="-1"><a class="header-anchor" href="#基本过程"><span>基本过程</span></a></h3><ul><li>甲方生成一对密钥并将其中的一把作为公用密钥向其它方公开</li><li>得到该公用密钥的乙方使用该密钥对机密信息进行加密后再发送给甲方</li><li>甲方再用自己保存的另一把私有密钥对加密后的信息进行解密</li></ul><h3 id="特点" tabindex="-1"><a class="header-anchor" href="#特点"><span>特点</span></a></h3><ul><li>安全性高</li><li>通信双方不需要预先商定密钥</li><li>密钥管理方便</li><li>算法复杂 加/解密速度较慢 （极端情况下比对称加密算法慢 1000 倍）</li></ul><h3 id="典型算法-1" tabindex="-1"><a class="header-anchor" href="#典型算法-1"><span>典型算法</span></a></h3><ul><li><em>RSA</em> 算法</li></ul><h3 id="实现" tabindex="-1"><a class="header-anchor" href="#实现"><span>实现</span></a></h3><ul><li>写法与 <em>AES</em> 算法类似</li><li>略 （参考 <em>CSDN</em>）</li></ul><hr><h2 id="_3-今天遇到的问题" tabindex="-1"><a class="header-anchor" href="#_3-今天遇到的问题"><span>3. 今天遇到的问题</span></a></h2><h3 id="javaweb-中遇到的问题" tabindex="-1"><a class="header-anchor" href="#javaweb-中遇到的问题"><span>JavaWeb 中遇到的问题</span></a></h3><ul><li><p>在算法实现中，需要用到 Apache Commons Codec 框架中的 Hex 类</p></li><li><p>Apache Commons Codec™ software provides implementations of common encoders and decoders such as Base64, Hex, Phonetic and URLs.</p></li><li><p>需要下载 <code>Commons-Codec-1.x.jar</code></p></li></ul><h3 id="tomcat-上遇到的问题" tabindex="-1"><a class="header-anchor" href="#tomcat-上遇到的问题"><span>Tomcat 上遇到的问题</span></a></h3><ul><li>将 jar 包导入工程后，运行时产生 <code>java.ClassNotFoundException</code></li><li>解决：将 jar 包 复制到 Tomcat 目录的 <code>/lib</code> 目录下</li></ul><h3 id="android-中遇到的问题" tabindex="-1"><a class="header-anchor" href="#android-中遇到的问题"><span>Android 中遇到的问题</span></a></h3><ul><li>将 jar 包导入工程后，编译错误：类中没有 xxx 方法</li><li>原因：Android 中有与该 jar 包重名的包，且内部没有实现方法</li><li>解决：下载 Codec 的源码，将包名更改，重新导出 jar 包，导入工程</li></ul><hr><h2 id="_4-总结" tabindex="-1"><a class="header-anchor" href="#_4-总结"><span>4. 总结</span></a></h2><p>今天花了八个小时研究这些加密算法</p><p>终于发现在 <em>物联网安全导论</em> 这门课中还是学到了一些东西的</p><p>在我们的 <em>cnsoft</em> 项目 —— <em>CARe</em> —— 的网络通信部分中</p><p>综合代码实现难度和安全性两方面的考虑</p><p>我最终选择了对称加密算法 <em>AES</em></p><p>最终我将该加密算法封装为一个 <em>SecurityUtil</em> 工具类</p><p>在网络通信前/后 直接调用静态方法进行加/解密</p><p>今天的难度主要在于</p><p>要将加密算法的实现嵌入到已经快做完的项目中</p><p>突然发现自己在 Android 端的网络通信部分没有做好封装</p><p>导致写了很多重复的代码</p><p>因此 今天在修改代码的时候</p><p>不得不把每个网络通信线程 class 都修改一遍</p><p>这是个刻骨铭心的教训</p><p>以后写之前多动脑子</p><p>写出高效率和高质量的代码</p><hr>`,56)]))}const d=s(l,[["render",c],["__file","Cryptography Symmetric _ Asymmetric Encryption.html.vue"]]),t=JSON.parse('{"path":"/notes/Cryptography/Cryptography%20Symmetric%20_%20Asymmetric%20Encryption.html","title":"Cryptography - Java 实现对称与非对称加密算法","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"1. 对称加密算法 （Symmetric Encryption Algorithm）","slug":"_1-对称加密算法-symmetric-encryption-algorithm","link":"#_1-对称加密算法-symmetric-encryption-algorithm","children":[{"level":3,"title":"优点","slug":"优点","link":"#优点","children":[]},{"level":3,"title":"缺点","slug":"缺点","link":"#缺点","children":[]},{"level":3,"title":"典型算法","slug":"典型算法","link":"#典型算法","children":[]},{"level":3,"title":"实现 （AES 算法）","slug":"实现-aes-算法","link":"#实现-aes-算法","children":[]},{"level":3,"title":"密钥可以字节流的方式存储在文件中","slug":"密钥可以字节流的方式存储在文件中","link":"#密钥可以字节流的方式存储在文件中","children":[]}]},{"level":2,"title":"2. 非对称加密算法（Asymmetric Cryptographic Algorithm）","slug":"_2-非对称加密算法-asymmetric-cryptographic-algorithm","link":"#_2-非对称加密算法-asymmetric-cryptographic-algorithm","children":[{"level":3,"title":"基本过程","slug":"基本过程","link":"#基本过程","children":[]},{"level":3,"title":"特点","slug":"特点","link":"#特点","children":[]},{"level":3,"title":"典型算法","slug":"典型算法-1","link":"#典型算法-1","children":[]},{"level":3,"title":"实现","slug":"实现","link":"#实现","children":[]}]},{"level":2,"title":"3. 今天遇到的问题","slug":"_3-今天遇到的问题","link":"#_3-今天遇到的问题","children":[{"level":3,"title":"JavaWeb 中遇到的问题","slug":"javaweb-中遇到的问题","link":"#javaweb-中遇到的问题","children":[]},{"level":3,"title":"Tomcat 上遇到的问题","slug":"tomcat-上遇到的问题","link":"#tomcat-上遇到的问题","children":[]},{"level":3,"title":"Android 中遇到的问题","slug":"android-中遇到的问题","link":"#android-中遇到的问题","children":[]}]},{"level":2,"title":"4. 总结","slug":"_4-总结","link":"#_4-总结","children":[]}],"git":{},"filePathRelative":"notes/Cryptography/Cryptography Symmetric & Asymmetric Encryption.md"}');export{d as comp,t as data};
